import argparse
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent


def run(cmd):
    print("\n$ " + " ".join(str(part) for part in cmd), flush=True)
    subprocess.run(cmd, cwd=HERE.parent, check=True)


def parse_args():
    parser = argparse.ArgumentParser(description="Train all PyTorch GPU models.")
    parser.add_argument("--vision-epochs", type=int, default=8)
    parser.add_argument("--market-epochs", type=int, default=80)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=128)
    return parser.parse_args()


def main():
    args = parse_args()
    run(
        [
            sys.executable,
            str(HERE / "train_vision.py"),
            "--epochs",
            str(args.vision_epochs),
            "--batch-size",
            str(args.batch_size),
            "--image-size",
            str(args.image_size),
        ]
    )
    run(
        [
            sys.executable,
            str(HERE / "train_market.py"),
            "--epochs",
            str(args.market_epochs),
        ]
    )


if __name__ == "__main__":
    main()
