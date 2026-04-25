import io
import json
import math
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn as nn
from PIL import Image


HERE = Path(__file__).resolve().parent
MODEL_DIR = HERE / "models"


class BiomassCNN(nn.Module):
    def __init__(self, out_dim: int):
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


class PriceMLP(nn.Module):
    def __init__(self, in_dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128),
            nn.GELU(),
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Linear(64, 1),
        )

    def forward(self, x):
        return self.net(x).squeeze(-1)


def choose_device() -> torch.device:
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_state_dict(path: Path, device: torch.device):
    return torch.load(path, map_location=device)


class ModelService:
    def __init__(self, model_dir: Path = MODEL_DIR):
        self.model_dir = model_dir
        self.device = choose_device()
        self.vision_metadata = load_json(model_dir / "vision_metadata.json")
        self.price_metadata = load_json(model_dir / "price_metadata.json")

        self.classifier = BiomassCNN(len(self.vision_metadata["classes"])).to(self.device)
        self.classifier.load_state_dict(
            load_state_dict(model_dir / "biomass_type_classifier.pt", self.device)
        )
        self.classifier.eval()

        self.quality_regressor = BiomassCNN(len(self.vision_metadata["quality_targets"])).to(
            self.device
        )
        self.quality_regressor.load_state_dict(
            load_state_dict(model_dir / "biomass_quality_regressor.pt", self.device)
        )
        self.quality_regressor.eval()

        self.price_model = PriceMLP(len(self.price_metadata["feature_columns"])).to(self.device)
        self.price_model.load_state_dict(load_state_dict(model_dir / "price_model.pt", self.device))
        self.price_model.eval()

    def preprocess_image(self, image_bytes: bytes) -> torch.Tensor:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_size = int(self.vision_metadata["image_size"])
        image = image.resize((image_size, image_size), Image.Resampling.BICUBIC)
        array = np.asarray(image, dtype=np.float32) / 255.0
        mean = np.asarray(self.vision_metadata["image_mean"], dtype=np.float32)
        std = np.asarray(self.vision_metadata["image_std"], dtype=np.float32)
        array = (array - mean) / std
        tensor = torch.from_numpy(array.transpose(2, 0, 1)).unsqueeze(0).float()
        return tensor.to(self.device)

    @torch.inference_mode()
    def predict_image(self, image_bytes: bytes) -> dict[str, Any]:
        x = self.preprocess_image(image_bytes)
        logits = self.classifier(x)
        probabilities = torch.softmax(logits, dim=1).detach().cpu().numpy()[0]
        class_index = int(probabilities.argmax())
        classes = self.vision_metadata["classes"]

        quality_scaled = self.quality_regressor(x).detach().cpu().numpy()[0]
        target_mean = np.asarray(self.vision_metadata["quality_target_mean"], dtype=np.float32)
        target_std = np.asarray(self.vision_metadata["quality_target_std"], dtype=np.float32)
        quality_raw = quality_scaled * target_std + target_mean

        return {
            "biomass_type": classes[class_index],
            "confidence": float(probabilities[class_index]),
            "class_probabilities": {
                label: float(probabilities[index]) for index, label in enumerate(classes)
            },
            "quality": {
                name: float(quality_raw[index])
                for index, name in enumerate(self.vision_metadata["quality_targets"])
            },
            "model": {
                "framework": "pytorch",
                "device": str(self.device),
                "classifier_accuracy": self.vision_metadata.get("classifier_metrics", {}).get(
                    "accuracy"
                ),
            },
        }

    def build_price_features(self, payload: dict[str, Any]) -> np.ndarray:
        values = []
        categorical_maps = self.price_metadata.get("categorical_maps", {})
        for column in self.price_metadata["feature_columns"]:
            value = payload.get(column)
            if value is None and column == "year" and payload.get("date"):
                value = str(payload["date"])[:4]
            if value is None and column == "month" and payload.get("date"):
                value = str(payload["date"])[5:7]
            if value is None and column == "day_of_year" and payload.get("date"):
                value = 1

            if column in categorical_maps:
                value = categorical_maps[column].get(str(value), 0)

            try:
                values.append(float(value if value is not None else 0.0))
            except (TypeError, ValueError):
                values.append(0.0)

        x = np.asarray(values, dtype=np.float32)
        mean = np.asarray(self.price_metadata["x_mean"], dtype=np.float32)
        std = np.asarray(self.price_metadata["x_std"], dtype=np.float32)
        return ((x - mean) / std).reshape(1, -1)

    @torch.inference_mode()
    def predict_price(self, payload: dict[str, Any]) -> dict[str, Any]:
        x = torch.from_numpy(self.build_price_features(payload)).float().to(self.device)
        pred_scaled = float(self.price_model(x).detach().cpu().numpy()[0])
        y_mean = float(self.price_metadata["y_mean"])
        y_std = float(self.price_metadata["y_std"])
        price = math.expm1(pred_scaled * y_std + y_mean)
        price = max(0.0, price)

        return {
            "predicted_price": price,
            "target_column": self.price_metadata["target_column"],
            "target_transform": self.price_metadata["target_transform"],
            "input_features": self.price_metadata["feature_columns"],
            "model": {
                "framework": "pytorch",
                "device": str(self.device),
                "metrics": self.price_metadata.get("metrics", {}),
            },
        }

    @staticmethod
    def carbon_for_burning(dry_mass_kg: float) -> dict[str, float]:
        co2_kg = dry_mass_kg * 1515 / 1000.0
        ch4_kg = dry_mass_kg * 2.7 / 1000.0
        n2o_kg = dry_mass_kg * 0.07 / 1000.0
        return {
            "co2_kg": co2_kg,
            "ch4_kg": ch4_kg,
            "n2o_kg": n2o_kg,
            "total_co2_eq_kg": co2_kg + ch4_kg * 28 + n2o_kg * 265,
        }
