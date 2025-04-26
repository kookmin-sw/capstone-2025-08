import numpy as np
import pathlib
import argparse
import tqdm
import skimage.measure as measure

def npy_paths(fold_dir: pathlib.Path):
    """
    Recursively search inside ``fold_dir`` for *images.npy* and *masks.npy*.
    This accommodates directory layouts such as::

        fold1/
          images/images.npy
          masks/masks.npy

    Returns
    -------
    Tuple[pathlib.Path, pathlib.Path]
        (images_path, masks_path)
    """
    images = list(fold_dir.rglob("images.npy"))
    masks  = list(fold_dir.rglob("masks.npy"))

    if not images or not masks:
        raise FileNotFoundError(f"{fold_dir} 안에 images.npy / masks.npy 를 찾지 못했습니다")

    # pick the shallowest (shortest path) match to reduce chance of picking nested cache dirs
    img_path = min(images, key=lambda p: len(p.parts))
    # choose a masks.npy that lives at the same depth as images.npy if possible
    same_depth_masks = [m for m in masks if len(m.parts) == len(img_path.parts)]
    msk_path = same_depth_masks[0] if same_depth_masks else min(masks, key=lambda p: len(p.parts))

    return img_path, msk_path