import json
import os
from collections import namedtuple

import torch
import torch.utils.data as data
from PIL import Image
import numpy as np

from dataclasses import dataclass

@dataclass
class CityscapesClass:
    name: str
    id: int
    train_id: int
    category: str
    category_id: int
    has_instances: bool
    ignore_in_eval: bool
    color: tuple

class Cityscapes(data.Dataset):
    """Cityscapes <http://www.cityscapes-dataset.com/> Dataset.
    
    **Parameters:**
        - **root** (string): Root directory of dataset where directory 'leftImg8bit' and 'gtFine' or 'gtCoarse' are located.
        - **split** (string, optional): The image split to use, 'train', 'test' or 'val' if mode="gtFine" otherwise 'train', 'train_extra' or 'val'
        - **mode** (string, optional): The quality mode to use, 'gtFine' or 'gtCoarse' or 'color'. Can also be a list to output a tuple with all specified target types.
        - **transform** (callable, optional): A function/transform that takes in a PIL image and returns a transformed version. E.g, ``transforms.RandomCrop``
        - **target_transform** (callable, optional): A function/transform that takes in the target and transforms it.
    """

    # Based on https://github.com/mcordts/cityscapesScripts

    def __init__(self, root, cmap_file, split='train', mode='fine', target_type='semantic', transform=None):
        self.root = os.path.expanduser(root)
        self.target_type = target_type
        self.images_dir = os.path.join(self.root, split, 'images')

        self.targets_dir = os.path.join(self.root, split, 'labels')
        self.transform = transform

        self.split = split
        self.images = []
        self.targets = []

        self.classes = [
            CityscapesClass('background', 0, 0, 'background', 0, False, True, (0, 0, 0))        
        ]

        with open(cmap_file, 'r') as f:
            cmap = json.load(f)
        
        for c in cmap:
            self.classes.append(
                CityscapesClass('c', c['label'], c['label'], 'c', c['label'], False, False, tuple(c['rgb']))
            )

        self.color_map = {c.id: list(c.color) for c in self.classes}
        self.color_to_train_id = {tuple(v): k for k, v in self.color_map.items()}
        self.train_id_to_color = [c.color for c in self.classes if (c.train_id != -1 and c.train_id != 255)]

        if split not in ['train', 'test', 'val']:
            raise ValueError('Invalid split for mode! Please use split="train", split="test"'
                             ' or split="val"')

        if split in ['train', 'val']:
            if not os.path.isdir(self.images_dir) or not os.path.isdir(self.targets_dir):
                raise RuntimeError('Dataset not found or incomplete. Please make sure all required folders for the'
                                ' specified "split" and "mode" are inside the "root" directory')

            for file_name in os.listdir(self.images_dir):
                if file_name.lower().endswith(('.jpg', '.png', '.jpeg')):
                    image_path = os.path.join(self.images_dir, file_name)
                    target_name = '{}_{}'.format(file_name.split('.png')[0], 'anno.png')
                    target_path = os.path.join(self.targets_dir, target_name)

                    if not os.path.exists(target_path):
                        continue  # 대응되는 라벨이 없으면 스킵

                    # target을 불러와서 encode
                    target_img = Image.open(target_path).convert("RGB")
                    encoded_target = self.encode_target(target_img)

                    # 전체 픽셀 수에서 background (label 0) 비율 계산
                    total_pixels = encoded_target.size
                    background_pixels = np.sum(encoded_target == 0)
                    background_ratio = background_pixels / total_pixels

                    if background_ratio < 0.8:
                        self.images.append(image_path)
                        self.targets.append(target_path)

    def encode_target(self, target):
        if isinstance(target, np.ndarray):
            img_np = target
        else:
            img_np = np.array(target)
        id_map = np.zeros((img_np.shape[0], img_np.shape[1]), dtype=np.uint8)
        for color, id_ in self.color_to_train_id.items():
            mask = np.all(img_np == color, axis=-1)
            id_map[mask] = id_

        return id_map

    def decode_target(self, target):
        rgb_mask = np.array([self.color_map[val] for val in target.flatten()]).reshape(target.shape[0], target.shape[1], 3)
        return rgb_mask

    def __getitem__(self, index):
        """
        Args:
            index (int): Index
        Returns:
            tuple: (image, target) where target is a tuple of all target types if target_type is a list with more
            than one item. Otherwise target is a json object if target_type="polygon", else the image segmentation.
        """
        image = Image.open(self.images[index]).convert('RGB')
        target = Image.open(self.targets[index]).convert("RGB")
        target = self.encode_target(target)

        target = Image.fromarray(target.astype(np.uint8))

        if self.transform:
            image, target = self.transform(image, target)
        return image, target

    def __len__(self):
        return len(self.images)

    def _load_json(self, path):
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def _get_target_suffix(self, mode, target_type):
        if target_type == 'instance':
            return '{}_instanceIds.png'.format(mode)
        elif target_type == 'semantic':
            return '{}_labelIds.png'.format(mode)
        elif target_type == 'color':
            return '{}_color.png'.format(mode)
        elif target_type == 'polygon':
            return '{}_polygons.json'.format(mode)
        elif target_type == 'depth':
            return '{}_disparity.png'.format(mode)