import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn.functional as F

from misc.utils import center_pad_to_shape, cropping_center
from .utils import crop_to_shape, dice_loss, mse_loss, msge_loss, xentropy_loss

from collections import OrderedDict

####
def train_step(batch_data, run_info):
    # TODO: synchronize the attach protocol
    run_info, state_info = run_info

    # Determine the appropriate device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    loss_func_dict = {
        "bce": xentropy_loss,
        "dice": dice_loss,
        "mse": mse_loss,
        "msge": msge_loss,
    }
    # use 'ema' to add for EMA calculation, must be scalar!
    result_dict = {"EMA": {}}
    track_value = lambda name, value: result_dict["EMA"].update({name: value})

    ####
    model = run_info["net"]["desc"]
    optimizer = run_info["net"]["optimizer"]

    ####
    imgs = batch_data["img"]
    true_np = batch_data["np_map"]
    true_hv = batch_data["hv_map"]

    # imgs = imgs.to("cuda").type(torch.float32)  # to NCHW
    imgs = imgs.to(device).type(torch.float32)
    imgs = imgs.permute(0, 3, 1, 2).contiguous()

    # HWC
    # true_np = true_np.to("cuda").type(torch.int64)
    # true_hv = true_hv.to("cuda").type(torch.float32)
    true_np = true_np.to(device).type(torch.int64)
    true_hv = true_hv.to(device).type(torch.float32)

    true_np_onehot = (F.one_hot(true_np, num_classes=2)).type(torch.float32)
    true_dict = {
        "np": true_np_onehot,
        "hv": true_hv,
    }

    if model.module.nr_types is not None:
        true_tp = batch_data["tp_map"]
        # true_tp = torch.squeeze(true_tp).to("cuda").type(torch.int64)
        true_tp = torch.squeeze(true_tp).to(device).type(torch.int64)
        true_tp_onehot = F.one_hot(true_tp, num_classes=model.module.nr_types)
        true_tp_onehot = true_tp_onehot.type(torch.float32)
        true_dict["tp"] = true_tp_onehot

    ####
    model.train()
    model.zero_grad()  # not rnn so not accumulate

    pred_dict = model(imgs)
    pred_dict = OrderedDict(
        [[k, v.permute(0, 2, 3, 1).contiguous()] for k, v in pred_dict.items()]
    )
    pred_dict["np"] = F.softmax(pred_dict["np"], dim=-1)
    if model.module.nr_types is not None:
        pred_dict["tp"] = F.softmax(pred_dict["tp"], dim=-1)

    ####
    loss = 0
    loss_opts = run_info["net"]["extra_info"]["loss"]
    for branch_name in pred_dict.keys():
        for loss_name, loss_weight in loss_opts[branch_name].items():
            loss_func = loss_func_dict[loss_name]
            loss_args = [true_dict[branch_name], pred_dict[branch_name]]
            if loss_name == "msge":
                loss_args.append(true_np_onehot[..., 1])
            term_loss = loss_func(*loss_args)
            track_value("loss_%s_%s" % (branch_name, loss_name), term_loss.cpu().item())
            loss += loss_weight * term_loss

    track_value("overall_loss", loss.cpu().item())
    # * gradient update

    # torch.set_printoptions(precision=10)
    loss.backward()
    optimizer.step()
    ####

    # pick 2 random sample from the batch for visualization
    sample_indices = torch.randint(0, true_np.shape[0], (2,))

    imgs = (imgs[sample_indices]).byte()  # to uint8
    imgs = imgs.permute(0, 2, 3, 1).contiguous().cpu().numpy()

    pred_dict["np"] = pred_dict["np"][..., 1]  # return pos only
    pred_dict = {
        k: v[sample_indices].detach().cpu().numpy() for k, v in pred_dict.items()
    }

    true_dict["np"] = true_np
    true_dict = {
        k: v[sample_indices].detach().cpu().numpy() for k, v in true_dict.items()
    }

    # * Its up to user to define the protocol to process the raw output per step!
    result_dict["raw"] = {  # protocol for contents exchange within `raw`
        "img": imgs,
        "np": (true_dict["np"], pred_dict["np"]),
        "hv": (true_dict["hv"], pred_dict["hv"]),
    }
    return result_dict


####
def valid_step(batch_data, run_info):
    run_info, state_info = run_info

    # Determine the appropriate device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    ####
    model = run_info["net"]["desc"]
    model.eval()  # infer mode

    ####
    imgs = batch_data["img"]
    true_np = batch_data["np_map"]
    true_hv = batch_data["hv_map"]

    # 데이터가 Tensor인지 numpy 배열인지 확인하고 변환
    def to_tensor(data, device, dtype):
        if isinstance(data, torch.Tensor):
            return data.to(device).type(dtype)
        return torch.from_numpy(data).to(device).type(dtype)

    # 데이터를 Tensor로 변환
    imgs_gpu = to_tensor(imgs, device, torch.float32)
    imgs_gpu = imgs_gpu.permute(0, 3, 1, 2).contiguous()

    true_np = to_tensor(true_np, device, torch.int64)
    true_hv = to_tensor(true_hv, device, torch.float32)

    true_dict = {
        "np": true_np,
        "hv": true_hv,
    }

    if model.module.nr_types is not None:
        true_tp = batch_data["tp_map"]
        true_tp = to_tensor(true_tp, device, torch.int64)
        true_dict["tp"] = true_tp

    with torch.no_grad():
        pred_dict = model(imgs_gpu)
        pred_dict = OrderedDict(
            [[k, v.permute(0, 2, 3, 1).contiguous()] for k, v in pred_dict.items()]
        )
        pred_dict["np"] = F.softmax(pred_dict["np"], dim=-1)[..., 1]
        if model.module.nr_types is not None:
            type_map = F.softmax(pred_dict["tp"], dim=-1)
            type_map = torch.argmax(type_map, dim=-1, keepdim=False)
            type_map = type_map.type(torch.float32)
            pred_dict["tp"] = type_map

    # numpy 배열로 변환
    def to_numpy(data):
        if isinstance(data, torch.Tensor):
            return data.cpu().numpy()
        return data

    result_dict = {
        "raw": {
            "imgs": to_numpy(imgs),
            "true_np": to_numpy(true_dict["np"]),
            "true_hv": to_numpy(true_dict["hv"]),
            "prob_np": to_numpy(pred_dict["np"]),
            "pred_hv": to_numpy(pred_dict["hv"]),
        }
    }
    if model.module.nr_types is not None:
        result_dict["raw"]["true_tp"] = to_numpy(true_dict["tp"])
        result_dict["raw"]["pred_tp"] = to_numpy(pred_dict["tp"])
    return result_dict


####
def infer_step(batch_data, model):

    ####
    patch_imgs = batch_data

    # Determine the appropriate device
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    patch_imgs_gpu = patch_imgs.to(device).type(torch.float32)  # to NCHW
    patch_imgs_gpu = patch_imgs_gpu.permute(0, 3, 1, 2).contiguous()

    ####
    model.eval()  # infer mode

    # --------------------------------------------------------------
    with torch.no_grad():  # dont compute gradient
        pred_dict = model(patch_imgs_gpu)
        pred_dict = OrderedDict(
            [[k, v.permute(0, 2, 3, 1).contiguous()] for k, v in pred_dict.items()]
        )
        pred_dict["np"] = F.softmax(pred_dict["np"], dim=-1)[..., 1:]
        if "tp" in pred_dict:
            type_map = F.softmax(pred_dict["tp"], dim=-1)
            type_map = torch.argmax(type_map, dim=-1, keepdim=True)
            type_map = type_map.type(torch.float32)
            pred_dict["tp"] = type_map
        pred_output = torch.cat(list(pred_dict.values()), -1)

    # * Its up to user to define the protocol to process the raw output per step!
    return pred_output.cpu().numpy()


####
def viz_step_output(raw_data, nr_types=None):
    """
    `raw_data` will be implicitly provided in the similar format as the 
    return dict from train/valid step, but may have been accumulated across N running step
    """
    try:
        imgs = raw_data["img"]
        true_np, pred_np = raw_data["np"]
        true_hv, pred_hv = raw_data["hv"]
        if nr_types is not None:
            true_tp, pred_tp = raw_data["tp"]

        # 데이터 shape 정규화
        def normalize_shape(data):
            if isinstance(data, list):
                data = np.array(data)
            if len(data.shape) > 3:  # 배치 차원이 있는 경우
                return data
            return np.expand_dims(data, axis=0)  # 배치 차원 추가

        # 데이터 정규화 및 차원 맞추기
        imgs = normalize_shape(imgs)
        true_np = normalize_shape(true_np)
        pred_np = normalize_shape(pred_np)
        true_hv = normalize_shape(true_hv)
        pred_hv = normalize_shape(pred_hv)
        if nr_types is not None:
            true_tp = normalize_shape(true_tp)
            pred_tp = normalize_shape(pred_tp)

        # 모든 데이터의 shape를 확인하고 일치시킴
        batch_size = len(imgs)
        aligned_shape = [imgs.shape[1:3], true_np.shape[1:3], pred_np.shape[1:3]]
        aligned_shape = np.min(np.array(aligned_shape), axis=0)

        cmap = plt.get_cmap("jet")

        def colorize(ch, vmin, vmax):
            ch = np.squeeze(ch.astype("float32"))
            ch[ch > vmax] = vmax
            ch[ch < vmin] = vmin
            ch = (ch - vmin) / (vmax - vmin + 1.0e-16)
            ch_cmap = (cmap(ch)[..., :3] * 255).astype("uint8")
            return ch_cmap

        viz_list = []
        for idx in range(batch_size):
            img = cropping_center(imgs[idx], aligned_shape)

            true_viz_list = [img]
            true_viz_list.append(colorize(true_np[idx], 0, 1))
            true_viz_list.append(colorize(true_hv[idx][..., 0], -1, 1))
            true_viz_list.append(colorize(true_hv[idx][..., 1], -1, 1))
            if nr_types is not None:
                true_viz_list.append(colorize(true_tp[idx], 0, nr_types))
            true_viz_list = np.concatenate(true_viz_list, axis=1)

            pred_viz_list = [img]
            pred_viz_list.append(colorize(pred_np[idx], 0, 1))
            pred_viz_list.append(colorize(pred_hv[idx][..., 0], -1, 1))
            pred_viz_list.append(colorize(pred_hv[idx][..., 1], -1, 1))
            if nr_types is not None:
                pred_viz_list.append(colorize(pred_tp[idx], 0, nr_types))
            pred_viz_list = np.concatenate(pred_viz_list, axis=1)

            viz_list.append(np.concatenate([true_viz_list, pred_viz_list], axis=0))
        viz_list = np.concatenate(viz_list, axis=0)
        return viz_list
    except Exception as e:
        print(f"시각화 중 오류 발생: {str(e)}")
        print(f"데이터 shape 정보:")
        print(f"imgs shape: {imgs.shape if 'imgs' in locals() else 'N/A'}")
        print(f"true_np shape: {true_np.shape if 'true_np' in locals() else 'N/A'}")
        print(f"pred_np shape: {pred_np.shape if 'pred_np' in locals() else 'N/A'}")
        print(f"true_hv shape: {true_hv.shape if 'true_hv' in locals() else 'N/A'}")
        print(f"pred_hv shape: {pred_hv.shape if 'pred_hv' in locals() else 'N/A'}")
        if nr_types is not None:
            print(f"true_tp shape: {true_tp.shape if 'true_tp' in locals() else 'N/A'}")
            print(f"pred_tp shape: {pred_tp.shape if 'pred_tp' in locals() else 'N/A'}")
        # 오류 발생 시 빈 이미지 반환
        return np.zeros((100, 100, 3), dtype=np.uint8)


####
from itertools import chain


def proc_valid_step_output(raw_data, nr_types=None):
    track_dict = {"scalar": {}, "image": {}}

    def track_value(name, value, vtype):
        return track_dict[vtype].update({name: value})

    def _dice_info(true, pred, label):
        true = np.array(true == label, np.int32)
        pred = np.array(pred == label, np.int32)
        inter = (pred * true).sum()
        total = (pred + true).sum()
        return inter, total

    # 데이터 shape 확인 및 정규화
    def normalize_shape(data):
        if isinstance(data, list):
            data = np.array(data)
        if len(data.shape) > 3:  # 배치 차원이 있는 경우
            return data
        return np.expand_dims(data, axis=0)  # 배치 차원 추가

    # 데이터 정규화
    prob_np = normalize_shape(raw_data["prob_np"])
    true_np = normalize_shape(raw_data["true_np"])
    pred_hv = normalize_shape(raw_data["pred_hv"])
    true_hv = normalize_shape(raw_data["true_hv"])
    imgs = normalize_shape(raw_data["imgs"])

    # 배치 크기 확인
    batch_size = len(true_np)
    
    over_inter = 0
    over_total = 0
    over_correct = 0

    for idx in range(batch_size):
        patch_prob_np = prob_np[idx]
        patch_true_np = true_np[idx]
        patch_pred_np = np.array(patch_prob_np > 0.5, dtype=np.int32)
        inter, total = _dice_info(patch_true_np, patch_pred_np, 1)
        correct = (patch_pred_np == patch_true_np).sum()
        over_inter += inter
        over_total += total
        over_correct += correct

    nr_pixels = batch_size * np.size(true_np[0])
    acc_np = over_correct / nr_pixels
    dice_np = 2 * over_inter / (over_total + 1.0e-8)
    track_value("np_acc", acc_np, "scalar")
    track_value("np_dice", dice_np, "scalar")

    if nr_types is not None:
        pred_tp = normalize_shape(raw_data["pred_tp"])
        true_tp = normalize_shape(raw_data["true_tp"])
        
        for type_id in range(0, nr_types):
            over_inter = 0
            over_total = 0
            for idx in range(batch_size):
                patch_pred_tp = pred_tp[idx]
                patch_true_tp = true_tp[idx]
                inter, total = _dice_info(patch_true_tp, patch_pred_tp, type_id)
                over_inter += inter
                over_total += total
            dice_tp = 2 * over_inter / (over_total + 1.0e-8)
            track_value("tp_dice_%d" % type_id, dice_tp, "scalar")

    over_squared_error = 0
    for idx in range(batch_size):
        patch_pred_hv = pred_hv[idx]
        patch_true_hv = true_hv[idx]
        squared_error = patch_pred_hv - patch_true_hv
        squared_error = squared_error * squared_error
        over_squared_error += squared_error.sum()
    mse = over_squared_error / nr_pixels
    track_value("hv_mse", mse, "scalar")

    # 시각화를 위한 데이터 선택
    selected_idx = np.random.randint(0, batch_size, size=(min(8, batch_size),)).tolist()
    viz_imgs = np.array([imgs[idx] for idx in selected_idx])
    viz_true_np = np.array([true_np[idx] for idx in selected_idx])
    viz_true_hv = np.array([true_hv[idx] for idx in selected_idx])
    viz_prob_np = np.array([prob_np[idx] for idx in selected_idx])
    viz_pred_hv = np.array([pred_hv[idx] for idx in selected_idx])
    
    viz_raw_data = {
        "img": viz_imgs,
        "np": (viz_true_np, viz_prob_np),
        "hv": (viz_true_hv, viz_pred_hv)
    }

    if nr_types is not None:
        viz_true_tp = np.array([true_tp[idx] for idx in selected_idx])
        viz_pred_tp = np.array([pred_tp[idx] for idx in selected_idx])
        viz_raw_data["tp"] = (viz_true_tp, viz_pred_tp)
        
    viz_fig = viz_step_output(viz_raw_data, nr_types)
    track_dict["image"]["output"] = viz_fig

    return track_dict
