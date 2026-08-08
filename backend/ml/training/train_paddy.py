"""
Training script for Paddy (Rice) crop disease prediction model.

Usage:
    python backend/ml/training/train_paddy.py [--dataset path/to/paddy_data.csv]
"""

import argparse
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from ml.training.common import run_crop_training

def main():
    parser = argparse.ArgumentParser(description="Train Paddy Disease Prediction Model")
    parser.add_argument("--dataset", type=str, default=None, help="Path to custom CSV dataset")
    args = parser.parse_args()

    run_crop_training("Paddy", dataset_path=args.dataset)

if __name__ == "__main__":
    main()
