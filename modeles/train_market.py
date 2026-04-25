import argparse
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, TensorDataset

from torch_runtime import DATA_DIR, ensure_output_dir, require_torch_gpu, write_json


TARGET_CANDIDATES = [
    "usdprice",
    "usd_price",
    "price_usd",
    "residue_price",
    "price",
    "value",
    "Value",
]
TARGET_ALIASES = {column.lower() for column in TARGET_CANDIDATES}


class PriceMLP(nn.Module):
    def __init__(self, in_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128),
            nn.GELU(),
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Linear(64, 1),
        )
        self.reset_parameters()

    def forward(self, x):
        return self.net(x).squeeze(-1)

    def reset_parameters(self):
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight, gain=0.3)
                nn.init.zeros_(module.bias)


def smooth_l1_loss(pred, target, beta=1.0):
    diff = pred - target
    abs_diff = diff.abs()
    quadratic = 0.5 * diff.square() / beta
    linear = abs_diff - 0.5 * beta
    return torch.where(abs_diff < beta, quadratic, linear).mean()


def create_demo_market_data():
    rng = np.random.default_rng(42)
    dates = pd.date_range(start="2020-01-01", periods=1200, freq="D")
    data = pd.DataFrame(
        {
            "date": dates,
            "month": dates.month,
            "crop_type": rng.integers(0, 4, len(dates)),
            "market": rng.integers(0, 12, len(dates)),
            "fertilizer_price": rng.uniform(50, 150, len(dates)),
            "transport_cost": rng.uniform(4, 28, len(dates)),
        }
    )
    data["residue_price"] = (
        9.0 * data["crop_type"]
        + 2.0 * data["market"]
        + 5.0 * np.sin(2 * np.pi * data["month"] / 12)
        + 0.22 * data["fertilizer_price"]
        + 0.6 * data["transport_cost"]
        + rng.normal(0, 2.0, len(dates))
    )
    return data, "synthetic_demo"


def load_market_data():
    raw_dir = DATA_DIR / "market" / "raw"
    if raw_dir.exists():
        csvs = sorted(raw_dir.glob("**/*.csv"))
        if csvs:
            frames = [pd.read_csv(path) for path in csvs]
            return pd.concat(frames, ignore_index=True), "csv:" + ",".join(str(p) for p in csvs[:3])

        hf_dir = raw_dir / "wfp_malawi"
        if hf_dir.exists():
            from datasets import load_from_disk

            dataset = load_from_disk(str(hf_dir))
            split = "train" if "train" in dataset else list(dataset.keys())[0]
            return dataset[split].to_pandas(), f"huggingface_disk:{hf_dir}"

    return create_demo_market_data()


def prepare_features(df, requested_target=None):
    df = df.copy()
    if requested_target:
        if requested_target not in df.columns:
            raise ValueError(f"Requested target column {requested_target} is not in the market data.")
        target_col = requested_target
    else:
        target_col = next((col for col in TARGET_CANDIDATES if col in df.columns), None)
    if target_col is None:
        raise ValueError(
            "Could not find a market price target column. Expected one of "
            f"{TARGET_CANDIDATES}."
        )

    df[target_col] = pd.to_numeric(df[target_col], errors="coerce")
    df = df.dropna(subset=[target_col])
    lower = df[target_col].quantile(0.01)
    upper = df[target_col].quantile(0.995)
    df = df[(df[target_col] >= lower) & (df[target_col] <= upper)]
    if df.empty:
        raise ValueError(f"Target column {target_col} has no numeric rows.")

    if "date" in df.columns:
        dates = pd.to_datetime(df["date"], errors="coerce")
        df["year"] = dates.dt.year.fillna(0)
        df["month"] = dates.dt.month.fillna(0)
        df["day_of_year"] = dates.dt.dayofyear.fillna(0)

    feature_cols = []
    categorical_maps = {}
    for col in df.columns:
        col_key = col.lower()
        if col == target_col or col_key in {"date", "id", "esa_processed", "esa_source"}:
            continue
        if col_key in TARGET_ALIASES:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
            feature_cols.append(col)
        elif df[col].dtype == object or str(df[col].dtype).startswith("category"):
            values = df[col].fillna("missing").astype(str)
            codes, uniques = pd.factorize(values)
            df[col] = codes.astype(np.float32)
            categorical_maps[col] = {str(value): int(idx) for idx, value in enumerate(uniques)}
            feature_cols.append(col)

    if not feature_cols:
        raise ValueError("No usable feature columns found for market training.")

    x = df[feature_cols].astype(np.float32).to_numpy()
    y_raw = df[target_col].astype(np.float32).to_numpy()
    y_transformed = np.log1p(np.maximum(y_raw, 0.0))
    x_mean = x.mean(axis=0)
    x_std = x.std(axis=0)
    x_std[x_std < 1e-6] = 1.0
    y_mean = float(y_transformed.mean())
    y_std = float(y_transformed.std() if y_transformed.std() >= 1e-6 else 1.0)
    x = (x - x_mean) / x_std
    y = (y_transformed - y_mean) / y_std
    return x, y, {
        "target_column": target_col,
        "target_transform": "log1p_then_standardize",
        "target_clip_quantiles": [0.01, 0.995],
        "target_clip_values": [float(lower), float(upper)],
        "feature_columns": feature_cols,
        "categorical_maps": categorical_maps,
        "x_mean": x_mean.tolist(),
        "x_std": x_std.tolist(),
        "y_mean": y_mean,
        "y_std": y_std,
    }


def evaluate(model, loader, device, y_mean, y_std):
    model.eval()
    losses = []
    errors = []
    for x, y in loader:
        x = x.to(device)
        pred = model(x)
        pred_scaled = pred.detach().cpu().numpy().astype(np.float64)
        y_scaled = y.numpy().astype(np.float64)
        losses.append(float(np.mean((pred_scaled - y_scaled) ** 2)))
        pred_log = pred_scaled * y_std + y_mean
        y_log = y_scaled * y_std + y_mean
        pred_raw = np.expm1(pred_log)
        y_raw = np.expm1(y_log)
        errors.append(np.abs(pred_raw - y_raw).astype(np.float64))
    all_errors = np.concatenate(errors)
    mae = float(all_errors.mean())
    rmse = float(np.sqrt(np.mean(all_errors**2)))
    return {"mse_scaled": float(np.mean(losses)), "mae": mae, "rmse": rmse}


def make_loader(x, y, batch_size, shuffle):
    dataset = TensorDataset(torch.from_numpy(x).float(), torch.from_numpy(y).float())
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, num_workers=0)


def parse_args():
    parser = argparse.ArgumentParser(description="Train market price regressor with PyTorch GPU.")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--target-column", default=None)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--debug-batches", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=None)
    return parser.parse_args()


def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    device = require_torch_gpu()
    output_dir = ensure_output_dir(args.output_dir) if args.output_dir else ensure_output_dir()

    df, source = load_market_data()
    x, y, metadata = prepare_features(df, args.target_column)
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=args.seed
    )
    if args.debug_batches:
        print(
            "debug split",
            "x_train",
            x_train.shape,
            float(np.min(x_train)),
            float(np.max(x_train)),
            "y_train",
            y_train.shape,
            float(np.min(y_train)),
            float(np.max(y_train)),
        )
    train_loader = make_loader(x_train, y_train, args.batch_size, True)
    test_loader = make_loader(x_test, y_test, args.batch_size, False)

    model = PriceMLP(x.shape[1]).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    print(f"Using PyTorch device: {device}")
    print(f"Market rows={len(df)} features={x.shape[1]} source={source}")

    for epoch in range(1, args.epochs + 1):
        model.train()
        losses = []
        for batch_x, batch_y in train_loader:
            batch_x = batch_x.to(device)
            batch_y = batch_y.to(device)
            optimizer.zero_grad(set_to_none=True)
            pred = model(batch_x)
            loss = smooth_l1_loss(pred, batch_y, beta=1.0)
            if args.debug_batches and len(losses) < 5:
                print(
                    "debug",
                    len(losses) + 1,
                    "loss",
                    float(loss.item()),
                    "pred",
                    float(pred.min().item()),
                    float(pred.max().item()),
                    "target",
                    float(batch_y.min().item()),
                    float(batch_y.max().item()),
                )
            if not torch.isfinite(loss):
                raise RuntimeError(
                    "Non-finite market loss detected. Lower --lr or inspect market target outliers."
                )
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            losses.append(float(loss.item()))
        if epoch == 1 or epoch % 10 == 0 or epoch == args.epochs:
            train_loss = float(np.mean(losses))
            metrics = evaluate(model, test_loader, device, metadata["y_mean"], metadata["y_std"])
            print(
                f"price epoch={epoch:03d} train_loss={train_loss:.4f} "
                f"test_rmse={metrics['rmse']:.2f} test_mae={metrics['mae']:.2f}"
            )

    metrics = evaluate(model, test_loader, device, metadata["y_mean"], metadata["y_std"])
    model_path = output_dir / "price_model.pt"
    torch.save(model.state_dict(), model_path)
    metadata.update(
        {
            "framework": "pytorch",
            "device": str(device),
            "source": source,
            "metrics": metrics,
        }
    )
    write_json(output_dir / "price_metadata.json", metadata)
    print(f"Saved {model_path}")


if __name__ == "__main__":
    main()
