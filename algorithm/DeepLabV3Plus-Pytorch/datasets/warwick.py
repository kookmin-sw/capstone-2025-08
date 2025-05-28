import os
from PIL import Image
import numpy as np
import torch
import torch.utils.data as data

class WarWick(data.Dataset):
    def __init__(self, root, split='train', transform=None):
        """
        python main.py --num_classes 2 --model deeplabv3plus_resnet101 --total_itrs 1000 --enable_vis --vis_port 1313 --gpu_id mps --crop_val --lr 0.01 --crop_size 513 --batch_size 8 --output_stride 16
        
        Args:
            image_dir (str): BMP 이미지가 저장된 디렉토리 경로
            label_dir (str): 레이블 BMP 파일이 저장된 디렉토리 경로
            transform (callable, optional): 입력 이미지에 적용할 변환(transform)
        """
        self.root = os.path.expanduser(root)
        self.image_dir = os.path.join(root, split, 'images')
        self.label_dir = os.path.join(root, split, 'labels')
        self.transform = transform
        self.image_files = [f for f in os.listdir(self.image_dir) if f.endswith('.png') or f.endswith('.bmp')]

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        # 이미지 경로 및 레이블 경로
        img_path = os.path.join(self.image_dir, self.image_files[idx])
        label_name = self.image_files[idx].replace('.bmp', '_anno.bmp')  # 레이블 이름 변경
        label_path = os.path.join(self.label_dir, label_name)  # 레이블 경로 설정

        # 이미지와 레이블을 읽음
        image = Image.open(img_path).convert('RGB')  # BMP 파일 읽기 및 RGB로 변환
        label = Image.open(label_path).convert('L')  # 레이블 BMP 파일은 그레이스케일로 읽기
        # 레이블은 픽셀 값이 클래스 번호임
        """
         0: background
         1: gland
        """
        label = np.array(label)  # numpy 배열로 변환
        label[label != 0] = 1 # 0이 아닌 값은 다 1로 변환
        label = Image.fromarray(label.astype(np.uint8))

        if self.transform :
            image, label = self.transform(image, label)
        
        return image, label
    
    @classmethod
    def decode_target(cls, mask):
        """decode semantic mask to RGB image for 0 and 1 classes"""
        cmap = {
            0: [0, 0, 0],       # 클래스 0: 검정색
            1: [255, 255, 255], # 클래스 1: 흰색
        }
        
        rgb_mask = np.array([cmap[val] for val in mask.flatten()]).reshape(mask.shape[0], mask.shape[1], 3)
        
        return rgb_mask