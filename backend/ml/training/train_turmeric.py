"""
Training script for Turmeric crop disease prediction model.

Usage:
    python backend/ml/training/train_turmeric.py [--dataset path/to/turmeric_data.csv]
"""

import argparse
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from ml.training.common import run_crop_training

def main():
    parser = argparse.ArgumentParser(description="Train Turmeric Disease Prediction Model")
    parser.add_argument("--dataset", type=str, default=None, help="Path to custom CSV dataset")
    args = parser.parse_args()

    run_crop_training("Turmeric", dataset_path=args.dataset)

if __name__ == "__main__":
    main()
