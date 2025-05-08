"""
python epistemic.py --input datasets/data/test/images --dataset cityscapes --model deeplabv3plus_resnet101 --ckpt checkpoints/best_deeplabv3plus_resnet101_cityscapes_os16_2025-02-21-12-10-55.pth --save_val_results_to "결과저장경로"
"""

from torch.utils.data import dataset
from tqdm import tqdm
import network
import utils
import os
import random
import argparse
import numpy as np

from torch.utils import data
from datasets import VOCSegmentation, Cityscapes, cityscapes, WarWick
from torchvision import transforms as T
from metrics import StreamSegMetrics

import torch
import torch.nn as nn

from PIL import Image
import matplotlib
import matplotlib.pyplot as plt
from glob import glob

def get_argparser():
    parser = argparse.ArgumentParser()

    # Datset Options
    parser.add_argument("--input", type=str, required=True,
                        help="path to a single image or image directory")
    parser.add_argument("--dataset", type=str, default='warwick',
                        choices=['voc', 'cityscapes', 'warwick'], help='Name of training set')

    # Deeplab Options
    available_models = sorted(name for name in network.modeling.__dict__ if name.islower() and \
                              not (name.startswith("__") or name.startswith('_')) and callable(
                              network.modeling.__dict__[name])
                              )

    parser.add_argument("--model", type=str, default='deeplabv3plus_mobilenet',
                        choices=available_models, help='model name')
    parser.add_argument("--separable_conv", action='store_true', default=False,
                        help="apply separable conv to decoder and aspp")
    parser.add_argument("--output_stride", type=int, default=16, choices=[8, 16])

    # Train Options
    parser.add_argument("--save_val_results_to", default=None,
                        help="save segmentation results to the specified dir")

    parser.add_argument("--crop_val", action='store_true', default=False,
                        help='crop validation (default: False)')
    parser.add_argument("--val_batch_size", type=int, default=4,
                        help='batch size for validation (default: 4)')
    parser.add_argument("--crop_size", type=int, default=513)

    parser.add_argument("--simulation_size", type=int, default=10, 
                        help="monte carlo dropout simulation size for epistemic scoring")
    
    parser.add_argument("--ckpt", default=None, type=str,
                        help="resume from checkpoint")
    parser.add_argument("--gpu_id", type=str, default='0',
                        help="GPU ID")
    return parser

def enable_dropout(model):
    for module in model.modules():
        if isinstance(module, nn.Dropout):
            module.train()


def save_heatmap(variance_map, save_path):
    red_cmap = matplotlib.colors.LinearSegmentedColormap.from_list("custom_red", ["white", "lightcoral", "red", "darkred"], N=256)

    plt.figure(figsize=(10, 10))

    threshold = np.percentile(variance_map, 90)

    if np.max(variance_map) < threshold:
        print(f"Skipping heatmap for {save_path}, no significant uncertainty.")
        return  

    vmax = max(threshold * 1.5, np.max(variance_map))
    norm = matplotlib.colors.Normalize(vmin=threshold, vmax=vmax)

    plt.imshow(variance_map, cmap=red_cmap, norm=norm)
    plt.axis('off')

    plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def entropy_volume(vol_input):
    vol_input = vol_input.astype("float32")
    reps = vol_input.shape[0]  # Monte Carlo Dropout 반복 횟수
    entropy = np.zeros(vol_input.shape[1:], dtype="float32")  # (H, W) 크기의 배열 초기화

    # Threshold values less than or equal to zero
    threshold = 0.00005
    vol_input[vol_input <= 0] = threshold

    # 확률 평균 및 로그 계산
    t_sum = np.sum(vol_input, axis=0)  # 반복된 예측값들의 합
    t_avg = np.divide(t_sum, reps)  # Monte Carlo 평균 확률값
    t_log = np.log(t_avg)
    t_entropy = -np.multiply(t_avg, t_log)  # H(p) = -p log(p)
    entropy += t_entropy  # 전체 엔트로피에 더함

    return entropy

def main():
    opts = get_argparser().parse_args()
    if opts.dataset.lower() == 'voc':
        opts.num_classes = 21
        decode_fn = VOCSegmentation.decode_target
    elif opts.dataset.lower() == 'cityscapes':
        opts.num_classes = 2
        decode_fn = Cityscapes.decode_target
    elif opts.dataset.lower() == 'warwick':
        opts.num_classes = 2
        decode_fn = WarWick.decode_target

    os.environ['CUDA_VISIBLE_DEVICES'] = opts.gpu_id
    device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
    print("Device: %s" % device)

    # Setup dataloader
    image_files = []
    if os.path.isdir(opts.input):
        for ext in ['png', 'jpeg', 'jpg', 'JPEG', 'bmp']:
            files = glob(os.path.join(opts.input, '**/*.%s'%(ext)), recursive=True)
            if len(files)>0:
                image_files.extend(files)
    elif os.path.isfile(opts.input):
        image_files.append(opts.input)
    
    # Set up model (all models are 'constructed at network.modeling)
    model = network.modeling.__dict__[opts.model](num_classes=opts.num_classes, output_stride=opts.output_stride)
    if opts.separable_conv and 'plus' in opts.model:
        network.convert_to_separable_conv(model.classifier)
    utils.set_bn_momentum(model.backbone, momentum=0.01)
    
    if opts.ckpt is not None and os.path.isfile(opts.ckpt):
        # https://github.com/VainF/DeepLabV3Plus-Pytorch/issues/8#issuecomment-605601402, @PytaichukBohdan
        checkpoint = torch.load(opts.ckpt, map_location=torch.device('cpu'))
        model.load_state_dict(checkpoint["model_state"])
        model = nn.DataParallel(model)
        model.to(device)
        print("Resume model from %s" % opts.ckpt)
        del checkpoint
    else:
        print("[!] Retrain")
        model = nn.DataParallel(model)
        model.to(device)

    #denorm = utils.Denormalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # denormalization for ori images

    if opts.crop_val:
        transform = T.Compose([
                T.Resize(opts.crop_size),
                T.CenterCrop(opts.crop_size),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225]),
            ])
    else:
        transform = T.Compose([
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225]),
            ])
    if opts.save_val_results_to is not None:
        os.makedirs(opts.save_val_results_to, exist_ok=True)
    with torch.no_grad():
        model = model.eval()
        enable_dropout(model)

    for img_path in tqdm(image_files):
        ext = os.path.basename(img_path).split('.')[-1]
        img_name = os.path.basename(img_path)[:-len(ext)-1]

        img = Image.open(img_path).convert('RGB')
        img = transform(img).unsqueeze(0)  # To tensor of NCHW
        img = img.to(device)

        preds = []
        for _ in range(opts.simulation_size):
            with torch.no_grad():
                pred = model(img).max(1)[1].cpu().numpy()[0]  # (H, W) 형태
                preds.append(pred)

        preds = np.array(preds)  # (simulation_size, H, W)

        # 엔트로피 계산
        entropy_map = entropy_volume(preds)  # (H, W)

        # 첫 번째 예측 결과 컬러화
        colorized_preds = decode_fn(preds[0]).astype('uint8')
        colorized_preds = Image.fromarray(colorized_preds)
        
        if opts.save_val_results_to:            
            heatmap_path = os.path.join(opts.save_val_results_to, img_name + '_heatmap.png')
            save_heatmap(entropy_map, heatmap_path)

if __name__ == '__main__':
    main()
