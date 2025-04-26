import copy, pathlib
from config import base_conf       # 원본 config.py의 dict

CFG = copy.deepcopy(base_conf)

CFG["model_mode"]      = "fast"
CFG["nr_types"]        = 5               # PanNuke: 5개 핵 클래스
CFG["type_info"]       = {"path": "type_info.json"}  # 그대로 두면 OK

root = pathlib.Path("dataset")
CFG["train_dir_list"]  = [str(root / "fold1")]
CFG["valid_dir_list"]  = [str(root / "fold2")]
CFG["test_dir_list"]   = [str(root / "fold3")]

CFG["shape_info"]["train"]["input_shape"]  = [256, 256]
CFG["shape_info"]["train"]["output_shape"] = [164, 164]
CFG["shape_info"]["valid"] = CFG["shape_info"]["train"]
CFG["shape_info"]["test"]  = CFG["shape_info"]["train"]

CFG["log_dir"] = "runs/hovernet_pannuke"      # 체크포인트 저장 폴더
CFG["epoch"]   = 50                           # 필요하면 조정
CFG["batch_size"] = 4                         # M2 Pro MPS에 적당
CFG["opt"]["lr"]  = 1e-4                      # 기본 learning rate