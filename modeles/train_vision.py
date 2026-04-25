import argparse
import time
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset

from torch_runtime import DATA_DIR, ensure_output_dir, require_torch_gpu, write_json


CLASSES = ["grass_dominant", "clover_dominant", "weed_dominant"]
IMAGE_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGE_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def _numeric(row, key, default=0.0):
    value = row.get(key, default)
    if pd.isna(value) or value == "":
        return default
    return float(value)


def read_grassclover_split(split):
    base = DATA_DIR / "vision" / "raw" / "grassclover" / "biomass_data" / split
    csv_path = base / f"biomass_{split}_data.csv"
    image_dir = base / "images"
    if not csv_path.exists():
        raise FileNotFoundError(
            f"Missing {csv_path}. Run `python modeles/download_vision_data.py` first."
        )

    df = pd.read_csv(csv_path, sep=";")
    df.columns = [col.replace("\ufeff", "").strip() for col in df.columns]
    records = []
    required_label_cols = {"dry_grass_fraction", "dry_clover_fraction", "dry_weeds_fraction", "dry_total"}
    missing_label_cols = required_label_cols.difference(df.columns)
    if missing_label_cols:
        raise RuntimeError(
            f"{csv_path} has no biomass labels ({sorted(missing_label_cols)} missing). "
            "Use the labeled train CSV and create a validation split instead."
        )

    for _, row in df.iterrows():
        image_path = image_dir / str(row["image_file_name"])
        if not image_path.exists():
            continue

        fractions = np.array(
            [
                _numeric(row, "dry_grass_fraction"),
                _numeric(row, "dry_clover_fraction"),
                _numeric(row, "dry_weeds_fraction"),
            ],
            dtype=np.float32,
        )
        if not np.isfinite(fractions).all() or fractions.sum() <= 0:
            continue

        fresh_total = (
            _numeric(row, "fresh_grass")
            + _numeric(row, "fresh_clover")
            + _numeric(row, "fresh_weeds")
        )
        dry_total = _numeric(row, "dry_total")
        dry_matter_fraction = dry_total / fresh_total if fresh_total > 0 else 0.0
        records.append(
            {
                "image_path": image_path,
                "class_id": int(fractions.argmax()),
                "quality_targets": np.array([dry_total, dry_matter_fraction], dtype=np.float32),
            }
        )

    if not records:
        raise RuntimeError(f"No usable records found in {csv_path}")
    return records


class GrassCloverDataset(Dataset):
    def __init__(self, records, image_size, task, target_mean=None, target_std=None, augment=False):
        self.records = records
        self.image_size = image_size
        self.task = task
        self.target_mean = target_mean
        self.target_std = target_std
        self.augment = augment

    def __len__(self):
        return len(self.records)

    def __getitem__(self, index):
        record = self.records[index]
        image = Image.open(record["image_path"]).convert("RGB")
        image = image.resize((self.image_size, self.image_size), Image.Resampling.BICUBIC)
        array = np.asarray(image, dtype=np.float32) / 255.0
        if self.augment and np.random.random() < 0.5:
            array = np.ascontiguousarray(array[:, ::-1, :])
        array = (array - IMAGE_MEAN) / IMAGE_STD
        x = torch.from_numpy(array.transpose(2, 0, 1)).float()

        if self.task == "classification":
            return x, torch.tensor(record["class_id"], dtype=torch.long)

        y = record["quality_targets"].copy()
        if self.target_mean is not None and self.target_std is not None:
            y = (y - self.target_mean) / self.target_std
        return x, torch.from_numpy(y).float()


class BiomassCNN(nn.Module):
    def __init__(self, out_dim):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 24, kernel_size=3, padding=1),
            nn.GELU(),
            nn.MaxPool2d(2),
            nn.Conv2d(24, 48, kernel_size=3, padding=1),
            nn.GELU(),
            nn.MaxPool2d(2),
            nn.Conv2d(48, 96, kernel_size=3, padding=1),
            nn.GELU(),
            nn.MaxPool2d(2),
            nn.AdaptiveAvgPool2d(1),
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(96, 64),
            nn.GELU(),
            nn.Linear(64, out_dim),
        )

    def forward(self, x):
        return self.head(self.features(x))


def make_loader(records, image_size, task, batch_size, shuffle, augment, target_mean=None, target_std=None):
    dataset = GrassCloverDataset(records, image_size, task, target_mean, target_std, augment)
    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=2,
        persistent_workers=True,
    )


@torch.no_grad()
def evaluate_classifier(model, loader, device):
    model.eval()
    total_loss = 0.0
    total = 0
    correct = 0
    for x, y in loader:
        x = x.to(device, non_blocking=True)
        y = y.to(device, non_blocking=True)
        logits = model(x)
        loss = F.cross_entropy(logits, y)
        total_loss += float(loss.item()) * y.size(0)
        correct += int((logits.argmax(dim=1) == y).sum().item())
        total += y.size(0)
    return {"loss": total_loss / max(total, 1), "accuracy": correct / max(total, 1)}


@torch.no_grad()
def evaluate_regressor(model, loader, device, target_mean, target_std):
    model.eval()
    total_loss = 0.0
    total = 0
    errors = []
    mean = torch.tensor(target_mean, device=device)
    std = torch.tensor(target_std, device=device)
    for x, y in loader:
        x = x.to(device, non_blocking=True)
        y = y.to(device, non_blocking=True)
        pred = model(x)
        loss = F.huber_loss(pred, y, delta=1.0)
        total_loss += float(loss.item()) * y.size(0)
        pred_raw = (pred * std) + mean
        y_raw = (y * std) + mean
        errors.append((pred_raw - y_raw).abs().detach().cpu())
        total += y.size(0)
    mae = torch.cat(errors, dim=0).mean(dim=0).numpy()
    return {
        "loss": total_loss / max(total, 1),
        "dry_total_mae": float(mae[0]),
        "dry_matter_fraction_mae": float(mae[1]),
    }


def train_classifier(train_records, test_records, args, device):
    train_loader = make_loader(
        train_records, args.image_size, "classification", args.batch_size, True, True
    )
    test_loader = make_loader(
        test_records, args.image_size, "classification", args.batch_size, False, False
    )
    model = BiomassCNN(len(CLASSES)).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    for epoch in range(1, args.epochs + 1):
        model.train()
        losses = []
        start_time = time.perf_counter()
        for batch_id, (x, y) in enumerate(train_loader, start=1):
            x = x.to(device, non_blocking=True)
            y = y.to(device, non_blocking=True)
            optimizer.zero_grad(set_to_none=True)
            loss = F.cross_entropy(model(x), y)
            loss.backward()
            optimizer.step()
            losses.append(float(loss.item()))
            if args.max_batches and batch_id >= args.max_batches:
                break
        metrics = evaluate_classifier(model, test_loader, device)
        print(
            f"classifier epoch={epoch:02d} train_loss={np.mean(losses):.4f} "
            f"test_loss={metrics['loss']:.4f} test_acc={metrics['accuracy']:.3f} "
            f"seconds={time.perf_counter() - start_time:.1f}"
        )
    return model, evaluate_classifier(model, test_loader, device)


def train_regressor(train_records, test_records, args, device):
    raw_targets = np.stack([record["quality_targets"] for record in train_records]).astype(np.float32)
    target_mean = raw_targets.mean(axis=0)
    target_std = raw_targets.std(axis=0)
    target_std[target_std < 1e-6] = 1.0

    train_loader = make_loader(
        train_records,
        args.image_size,
        "regression",
        args.batch_size,
        True,
        True,
        target_mean,
        target_std,
    )
    test_loader = make_loader(
        test_records,
        args.image_size,
        "regression",
        args.batch_size,
        False,
        False,
        target_mean,
        target_std,
    )
    model = BiomassCNN(2).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    for epoch in range(1, args.epochs + 1):
        model.train()
        losses = []
        start_time = time.perf_counter()
        for batch_id, (x, y) in enumerate(train_loader, start=1):
            x = x.to(device, non_blocking=True)
            y = y.to(device, non_blocking=True)
            optimizer.zero_grad(set_to_none=True)
            loss = F.huber_loss(model(x), y, delta=1.0)
            loss.backward()
            optimizer.step()
            losses.append(float(loss.item()))
            if args.max_batches and batch_id >= args.max_batches:
                break
        metrics = evaluate_regressor(model, test_loader, device, target_mean, target_std)
        print(
            f"quality epoch={epoch:02d} train_loss={np.mean(losses):.4f} "
            f"test_loss={metrics['loss']:.4f} dry_total_mae={metrics['dry_total_mae']:.2f} "
            f"dry_matter_mae={metrics['dry_matter_fraction_mae']:.4f} "
            f"seconds={time.perf_counter() - start_time:.1f}"
        )
    metrics = evaluate_regressor(model, test_loader, device, target_mean, target_std)
    return model, metrics, target_mean, target_std


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train biomass vision models with PyTorch on Apple Silicon GPU."
    )
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--max-train-samples", type=int, default=None)
    parser.add_argument("--validation-size", type=float, default=0.2)
    parser.add_argument("--max-batches", type=int, default=None)
    parser.add_argument("--output-dir", type=Path, default=None)
    return parser.parse_args()


def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    device = require_torch_gpu()
    output_dir = ensure_output_dir(args.output_dir) if args.output_dir else ensure_output_dir()

    records = read_grassclover_split("train")
    class_ids = [record["class_id"] for record in records]
    class_counts = np.bincount(class_ids, minlength=len(CLASSES))
    stratify = class_ids if class_counts.min() >= 2 else None
    train_records, test_records = train_test_split(
        records,
        test_size=args.validation_size,
        random_state=args.seed,
        stratify=stratify,
    )
    if args.max_train_samples:
        train_records = train_records[: args.max_train_samples]

    print(f"Using PyTorch device: {device}")
    print(f"Vision train records={len(train_records)} validation records={len(test_records)}")

    classifier, classifier_metrics = train_classifier(train_records, test_records, args, device)
    regressor, regressor_metrics, target_mean, target_std = train_regressor(
        train_records, test_records, args, device
    )

    classifier_path = output_dir / "biomass_type_classifier.pt"
    regressor_path = output_dir / "biomass_quality_regressor.pt"
    torch.save(classifier.state_dict(), classifier_path)
    torch.save(regressor.state_dict(), regressor_path)
    write_json(
        output_dir / "vision_metadata.json",
        {
            "framework": "pytorch",
            "device": str(device),
            "classes": CLASSES,
            "image_size": args.image_size,
            "image_mean": IMAGE_MEAN.tolist(),
            "image_std": IMAGE_STD.tolist(),
            "quality_targets": ["dry_total", "dry_matter_fraction"],
            "quality_target_mean": target_mean.tolist(),
            "quality_target_std": target_std.tolist(),
            "classifier_metrics": classifier_metrics,
            "quality_metrics": regressor_metrics,
            "source_dataset": "GrassClover biomass_data",
        },
    )
    print(f"Saved {classifier_path}")
    print(f"Saved {regressor_path}")


if __name__ == "__main__":
    main()
