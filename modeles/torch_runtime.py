import json
import platform
from pathlib import Path

import torch


MODELES_DIR = Path(__file__).resolve().parent
DATA_DIR = MODELES_DIR / "data"
OUTPUT_DIR = MODELES_DIR / "models"


def require_torch_gpu():
    if platform.system() == "Darwin" and torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        raise SystemExit(
            "No PyTorch GPU backend is available. On Apple Silicon, run this in "
            "a normal macOS terminal with a PyTorch build that supports MPS."
        )

    torch.set_float32_matmul_precision("high")
    return device


def ensure_output_dir(path=OUTPUT_DIR):
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_json(path, payload):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")
