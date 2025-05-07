"""
Minimal training launcher for HoVer-Net on PanNuke (fold1 → train, fold2 → val).

Prerequisite: config_pannuke.py sets CFG dict correctly.
"""

import os
import torch

from run_train import TrainManager
from config_pannuke import CFG


if __name__ == "__main__":
    # Disable CUDA IDs so that PyTorch selects CPU/MPS on Apple Silicon
    os.environ["CUDA_VISIBLE_DEVICES"] = ""

    print("Starting training with batch_size =", CFG.get("batch_size", "not set"))
    trainer = TrainManager()
    trainer.model_config = CFG
    trainer.run()