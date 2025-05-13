from app import app
import glob
import os
import random
import shutil
import boto3
from PIL import Image
import subprocess
import openslide
import requests
import json
import uuid

# 대용량 이미지 처리 가능하도록 설정
Image.MAX_IMAGE_PIXELS = None  # DecompressionBombError 방지
tile_size = 700

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../datasets/data")
ORIGIN_DIR = os.path.join(BASE_DIR, "../datasets/data/origin")
RESULT_DIR = os.path.join(BASE_DIR, "../datasets/data/result")
TEST_DIR = os.path.join(BASE_DIR, "../datasets/data/test")
TRAIN_DIR = os.path.join(BASE_DIR, "../datasets/data/train")
VAL_DIR = os.path.join(BASE_DIR, "../datasets/data/val")
MODEL_DIR = os.path.join(BASE_DIR, "../model")

def process(request_data):
    settings = app.state.settings

    # s3 초기화
    s3 = boto3.client("s3",
                      region_name=settings.AWS_REGION_NAME,
                      aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                      aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
    s3_bucket_name = settings.AWS_S3_BUCKET_NAME

    # 폴더 없으면 만들기
    print("폴더 없으면 만들기")
    ensure_dirs()

    # 기존에 폴더에 있는 이미지랑 모델 삭제 (process 종료 직전에 동일하게 진행하지만, 테스트 중에 혹시 삭제 안된 것들이 있을 수 있어서 코드 추가)
    print("기존에 폴더에 있는 이미지랑 모델 삭제")
    delete_files()

    # s3에서 svs 목록 로컬에 저장
    print("s3에서 svs 목록 로컬에 저장")
    download_svs(s3, s3_bucket_name, request_data)

    if request_data["modelType"] in {"TISSUE", "MULTI"}:
        tissue_process(request_data, s3, s3_bucket_name)

    if request_data["modelType"] in {"CELL", "MULTI"}:
        cell_process(request_data)

    # 로컬에 다운받고 사용했던 이미지와 모델 삭제
    delete_files()

    # 응용 서버 호출
    notify_application_server(request_data, settings)

def tissue_process(request_data, s3, s3_bucket_name):
    print("TISSUE 작업 실행")

    # sqs 메시지에서 제시해준 모델을 로컬에 저장
    print("sqs 메시지에서 제시해준 모델을 로컬에 저장")
    # download_model(s3, s3_bucket_name, request_data)

    # s3에서 타일링 ROI 목록 로컬에 저장
    print("s3에서 타일링 ROI 목록 로컬에 저장")
    # download_tile_images(s3, s3_bucket_name, request_data)

    # roi 사진을 700 * 700 여러 개로 자르고 저장
    print("roi 사진을 700 * 700 여러 개로 자르고 저장")
    split_and_save_images(request_data)

    # 각 잘라진 사진 정보에 맞게 svs에서 해당 부분들 저장
    print("각 잘라진 사진 정보에 맞게 svs에서 해당 부분들 저장")
    extract_svs_regions()

    # test에 저장한 사진들을 train과 test로 복사하기
    print("test에 저장한 사진들을 train과 val로 복사")
    split_test_to_train_val()

    # cmap.json 생성
    generate_cmap_json(request_data)

    # 학습
    if request_data["type"] == "TRAINING_INFERENCE":
        print("학습")
        run_subprocess("train", request_data)
        upload_model(s3, s3_bucket_name, request_data)

    # 추론
    print("추론")
    run_subprocess("predict", request_data)

    # 추론 결과물들을 원래 같았던 roi 끼리 합치기
    print("추론 결과물들을 원래 같았던 roi 끼리 합치기")
    merge_images()

    # 합친 roi들을 s3에 업로드
    print("합친 roi들을 s3에 업로드")
    upload_images(s3, s3_bucket_name, request_data)

def cell_process(request_data):
    print("CELL 작업 실행")

    # svs에서 700*700 타일링 이미지 추출
    cell_split_save_images(request_data)

    # 모델 인풋 예상 : 사진 목록, 폴리곤 목록

    #

def download_svs(s3, s3_bucket_name, request_data):
    for sub_project in request_data["subProjects"]:
        sub_project_id = str(sub_project["subProjectId"])
        svs_s3_path = sub_project["svsPath"]
        svs_save_path = os.path.join(ORIGIN_DIR, "svs") + "/" + sub_project_id + ".svs"
        s3.download_file(s3_bucket_name, svs_s3_path, svs_save_path)

def cell_split_save_images(request_data):
    input_folder = os.path.join(ORIGIN_DIR, "svs")
    output_folder = os.path.join(TEST_DIR, "images")

    for sub_project in request_data.get("subProjects", []):
        sub_project_id = str(sub_project["subProjectId"])
        svs_path = input_folder + "/" + sub_project_id + ".svs"
        slide = openslide.OpenSlide(svs_path)

        for roi in sub_project.get("roi", []):
            roi_id = str(roi["roiId"])
            base_name = f"{sub_project_id}_{roi_id}"
            orig_x = roi["detail"]["x"]
            orig_y = roi["detail"]["y"]
            width = roi["detail"]["width"]
            height = roi["detail"]["height"]

            for y in range(0, height, tile_size):
                for x in range(0, width, tile_size):
                    new_x, new_y = orig_x + x, orig_y + y
                    new_width = min(width - x, tile_size)
                    new_height = min(height - y, tile_size)

                    region = slide.read_region((new_x, new_y), level=0, size=(new_width, new_height))
                    region = region.convert("RGB")  # RGBA -> RGB 변환

                    tile_filename = f"{base_name}_{new_x}_{new_y}.png"
                    output_image_path = os.path.join(output_folder, tile_filename)
                    region.save(output_image_path)

        slide.close()


def ensure_dirs():
    # data
    for subfolder in ["origin", "result", "test", "train", "val"]:
        os.makedirs(os.path.join(DATA_DIR,subfolder), exist_ok=True)

    # origin
    for subfolder in ["svs", "tile"]:
        os.makedirs(os.path.join(ORIGIN_DIR, subfolder), exist_ok=True)

    # result
    for subfolder in ["roi", "tile"]:
        os.makedirs(os.path.join(RESULT_DIR, subfolder), exist_ok=True)

    # test, train, val
    folders = [TEST_DIR, TRAIN_DIR, VAL_DIR]
    for folder in folders:
        for subfolder in ["images", "labels"]:
            os.makedirs(os.path.join(folder, subfolder), exist_ok=True)

def download_model(s3, s3_bucket_name, request_data):
    s3_path = request_data["tissueModelPath"]
    save_path = os.path.join(MODEL_DIR, "checkpoints/model.pth")
    s3.download_file(s3_bucket_name, s3_path, save_path)

def download_tile_images(s3, s3_bucket_name, request_data):
    # s3에서 타일링 ROI 목록 로컬에 저장하기
    for sub_project in request_data["subProjects"]:
        sub_project_id = str(sub_project["subProjectId"])

        for idx, roi in enumerate(sub_project["roi"], start=1):
            image_s3_path = roi["tissuePath"]
            basename = os.path.basename(image_s3_path)
            extension = basename.rsplit('.')[1]
            name = sub_project_id + "_" + str(roi["roiId"]) + "." + extension
            image_save_path = os.path.join(ORIGIN_DIR, "tile") + "/" + name
            s3.download_file(s3_bucket_name, image_s3_path, image_save_path)

def split_and_save_images(request_data):
    input_folder = os.path.join(ORIGIN_DIR, "tile")
    output_folder = os.path.join(TEST_DIR, "labels")

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".png"):
            image_path = os.path.join(input_folder, filename)
            image = Image.open(image_path)

            base_name = filename.rsplit(".")[0]
            sub_project_id = base_name.split("_")[0]
            sub_project = None
            for tmp in request_data.get("subProjects", []):
                if str(tmp.get("subProjectId")) == sub_project_id:
                    sub_project = tmp
                    break

            orig_x = orig_y = None
            for image_info in sub_project.get("roi", []):
                name = sub_project_id + "_" + str(image_info["roiId"])
                if base_name == name:
                    orig_x = image_info["detail"]["x"]
                    orig_y = image_info["detail"]["y"]
                    break

            width, height = image.size

            # 이미지 타일링
            for y in range(0, height, tile_size):
                for x in range(0, width, tile_size):
                    box = (x, y, min(x + tile_size, width), min(y + tile_size, height))
                    tile = image.crop(box)
                    new_x, new_y = orig_x + x, orig_y + y  # 원본 사진 기준 좌표 계산
                    tile_filename = f"{base_name}_{new_x}_{new_y}_anno.png"
                    tile_path = os.path.join(output_folder, tile_filename)
                    tile.save(tile_path)

def extract_svs_regions():
    labels_folder = os.path.join(TEST_DIR, "labels")
    output_folder = os.path.join(TEST_DIR, "images")

    for filename in os.listdir(labels_folder):
        if filename.lower().endswith(".png"):
            name_without_ext = filename.rsplit(".", 1)[0]
            base_name, x_str, y_str, _ = name_without_ext.rsplit("_", 3)
            x = int(x_str)
            y = int(y_str)
            label_image_path = os.path.join(labels_folder, filename)
            label_image = Image.open(label_image_path)
            tile_w, tile_h = label_image.size  # 잘라야 할 크기

            sub_project_id = name_without_ext.split("_")[0]
            svs_file_name = sub_project_id + ".svs"
            svs_path = get_svs_file(svs_file_name)

            slide = openslide.OpenSlide(svs_path)
            region = slide.read_region((x, y), level=0, size=(tile_w, tile_h))
            region = region.convert("RGB")

            output_image_path = os.path.join(output_folder, filename.replace("_anno", ""))
            region.save(output_image_path)
            slide.close()

def get_svs_file(filename):
    svs_folder = os.path.join(ORIGIN_DIR, "svs")
    target_path = os.path.join(svs_folder, filename)
    if os.path.isfile(target_path):
        return target_path
    return None

def split_test_to_train_val():
    test_images_folder = os.path.join(TEST_DIR, "images")
    test_labels_folder = os.path.join(TEST_DIR, "labels")
    train_images_folder = os.path.join(TRAIN_DIR, "images")
    train_labels_folder = os.path.join(TRAIN_DIR, "labels")
    val_images_folder = os.path.join(VAL_DIR, "images")
    val_labels_folder = os.path.join(VAL_DIR, "labels")

    # 사진을 모두 가져옴
    images = sorted([f for f in os.listdir(test_images_folder) if f.lower().endswith(".png")])
    random.shuffle(images)  # 랜덤으로 섞음

    split_idx = int(len(images) * 0.8)  # 80% 는 train, 20% 는 validation
    train_files = images[:split_idx]
    val_files = images[split_idx:]

    # images와 labels를 복사해서 train과 val 폴더에 넣음
    for file_list, img_dest, lbl_dest in [(train_files, train_images_folder, train_labels_folder),
                                          (val_files, val_images_folder, val_labels_folder)]:
        for file in file_list:
            label_file = file.replace(".png", "_anno.png")
            shutil.copy(os.path.join(test_images_folder, file), os.path.join(img_dest, file))
            shutil.copy(os.path.join(test_labels_folder, label_file), os.path.join(lbl_dest, label_file))

    print(f"Split completed: {len(train_files)} train images, {len(val_files)} val images")

def generate_cmap_json(request_data):
    labels = request_data.get("labels", [])
    cmap = []

    for label in labels:
        cmap.append({
            "label": label["classIndex"] + 1,
            "rgb": label["color"]
        })

    # JSON 파일로 저장
    output_path = os.path.join(BASE_DIR, "../model")
    file_path = os.path.join(output_path, "cmap.json")

    with open(file_path, "w") as f:
        json.dump(cmap, f, indent=2)

    print("cmap.json 저장 완료")

def run_subprocess(mode: str, request_data):
    """ 학습 또는 예측을 실행하는 함수 """
    command = get_command(mode, request_data)  # mode에 따라 명령어 가져오기
    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1
    )

    # 실시간으로 출력 읽기
    for line in iter(process.stdout.readline, ""):
        print(line, end="")  # 터미널에 출력

    stdout, stderr = process.communicate()  # 프로세스 종료 대기

    return stdout

# 학습 및 예측에 공통으로 사용하는 명령어 생성 함수
def get_command(mode: str, request_data):
    """ 학습(train) 또는 예측(predict) 명령어를 생성하는 함수 """
    num_classes = str(len(request_data["labels"]) + 1)

    if mode == "train":
        command = [
            "python", os.path.join(BASE_DIR, "../model/main.py"),
            "--data_root", os.path.join(BASE_DIR, "../datasets/data"),
            "--dataset", "cityscapes",
            "--model", "deeplabv3plus_resnet101",
            "--total_itrs", "1000",
            "--gpu_id", "mps",
            "--crop_val",
            "--lr", "0.01",
            "--crop_size", "513",
            "--batch_size", "8",
            "--output_stride", "16",
            "--cmap_file", os.path.join(MODEL_DIR, "cmap.json"),
            "--num_classes", num_classes,
            "--gpu_id", "0"
        ]
        if request_data.get("tissueModelPath"):  # None 또는 빈 문자열이 아닌 경우에만 추가
            checkpoint_dir = os.path.join(MODEL_DIR, "checkpoints")
            latest_checkpoint = get_latest_checkpoint(checkpoint_dir)
            command += ["--ckpt", latest_checkpoint]
        return command
    elif mode == "predict":
        checkpoint_dir = os.path.join(MODEL_DIR, "checkpoints")
        latest_checkpoint = get_latest_best_checkpoint(checkpoint_dir)
        return [
            "python", os.path.join(BASE_DIR, "../model/predict.py"),
            "--input", os.path.join(TEST_DIR, "images"),
            "--dataset", "cityscapes",
            "--model", "deeplabv3plus_resnet101",
            "--ckpt", latest_checkpoint,
            "--save_val_results_to", os.path.join(RESULT_DIR, "tile/"),
            "--cmap_file", os.path.join(MODEL_DIR, "cmap.json"),
            "--num_classes", num_classes
        ]
    else:
        raise ValueError("Invalid mode: choose 'train' or 'predict'")

def get_model(checkpoint_dir):
    """ 'best_'로 시작하는 .pth 파일 중 가장 최근에 수정된 파일 반환 """
    best_pth_files = glob.glob(os.path.join(checkpoint_dir, "best_*.pth"))

    if not best_pth_files:
        raise FileNotFoundError(f"체크포인트 폴더({checkpoint_dir})에 'best_'로 시작하는 .pth 파일이 없습니다!")

    latest_best_pth = max(best_pth_files, key=os.path.getmtime)
    return latest_best_pth

def get_latest_checkpoint(checkpoint_dir):
    """ 모든 .pth 파일 중에서 가장 최근에 수정된 파일 반환 """
    pth_files = glob.glob(os.path.join(checkpoint_dir, "*.pth"))

    if not pth_files:
        raise FileNotFoundError(f"체크포인트 폴더({checkpoint_dir})에 .pth 파일이 없습니다!")

    latest_pth = max(pth_files, key=os.path.getmtime)
    return latest_pth

def get_latest_best_checkpoint(checkpoint_dir):
    best_pth_files = glob.glob(os.path.join(checkpoint_dir, "best_*.pth"))
    if best_pth_files:
        latest_best_pth = max(best_pth_files, key=os.path.getmtime)
        return latest_best_pth

    pth_files = glob.glob(os.path.join(checkpoint_dir, "*.pth"))
    if not pth_files:
        raise FileNotFoundError(f"체크포인트 폴더({checkpoint_dir})에 .pth 파일이 없습니다!")

    latest_pth = max(pth_files, key=os.path.getmtime)
    return latest_pth

def merge_images():
    input_folder = os.path.join(RESULT_DIR, "tile")
    output_folder = os.path.join(RESULT_DIR, "roi")

    # 파일명에서 원본 이미지 이름과 좌표 정보 추출
    image_tiles = {}
    tile_sizes = {}  # 각 타일의 크기 저장

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".png"):
            parts = filename.rsplit("_", 2)  # 파일명이 원본_좌표X_좌표Y.png 형태라고 가정
            if len(parts) == 3:
                base_name, x, y = parts
                x, y = int(x), int(y.replace(".png", ""))
                tile_path = os.path.join(input_folder, filename)
                tile = Image.open(tile_path)
                tile_width, tile_height = tile.size

                if base_name not in image_tiles:
                    image_tiles[base_name] = []
                    tile_sizes[base_name] = []
                image_tiles[base_name].append((x, y, tile_width, tile_height, filename))
                tile_sizes[base_name].append((x + tile_width, y + tile_height))

    # 원본 이미지별로 타일을 합치기
    for base_name, tiles in image_tiles.items():
        # 좌표 기준 정렬
        tiles.sort(key=lambda t: (t[1], t[0]))  # y 좌표 기준 정렬 후 x 좌표 기준 정렬

        # 전체 크기 계산 (모든 타일을 포함하도록 설정)
        min_x = min(t[0] for t in tiles)
        min_y = min(t[1] for t in tiles)
        max_x = max(t[0] + t[2] for t in tiles)  # 가장 큰 x + width
        max_y = max(t[1] + t[3] for t in tiles)  # 가장 큰 y + height

        # 정확한 크기의 캔버스 생성
        merged_image = Image.new("RGB", (max_x - min_x, max_y - min_y))

        for x, y, tile_width, tile_height, filename in tiles:
            tile_path = os.path.join(input_folder, filename)
            tile = Image.open(tile_path)

            # 원래 좌표에 정확히 배치
            merged_image.paste(tile, (x - min_x, y - min_y))

        output_path = os.path.join(output_folder, f"{base_name}.png")
        merged_image.save(output_path)
        print(f"Merged image saved: {output_path}")

def upload_images(s3, s3_bucket_name, request_data):
    result_path = os.path.join(RESULT_DIR, "roi")

    for sub_project in request_data.get("subProjects", []):
        sub_project_id = str(sub_project.get("subProjectId"))
        annotation_history_id = sub_project.get("annotationHistoryId")

        for roi in sub_project.get("roi", []):
            roi_id = str(roi.get("roiId"))

            for filename in os.listdir(result_path):
                file_path = os.path.join(result_path, filename)

                s3_key = (
                    f"sub-project/{sub_project_id}/"
                    f"annotation-history/{annotation_history_id}/"
                    f"inference/{filename}"
                )
                s3_path = f"s3://{s3_bucket_name}/{s3_key}"
                print(f"업로드: {s3_path}")
                s3.upload_file(file_path, s3_bucket_name, s3_key)

                roi["tissuePath"] = s3_key


def upload_model(s3, s3_bucket_name, request_data):
    checkpoint_dir = os.path.join(MODEL_DIR, "checkpoints")
    file_path = get_latest_best_checkpoint(checkpoint_dir)  # 최신 pth 파일 가져오기
    model_name = f"{uuid.uuid4()}.pth"
    if os.path.isfile(file_path):
        s3_key = f"model/{model_name}"
        s3.upload_file(file_path, s3_bucket_name, s3_key)
        request_data["tissueModelPath"] = f"models/{model_name}",

def delete_files():
    print("Deleting local files")

    # cmap.json
    cmap_path = os.path.join(MODEL_DIR, "cmap.json")
    if os.path.exists(cmap_path):
        os.remove(cmap_path)

    # model
    folder_path = os.path.join(MODEL_DIR, "checkpoints")
    for file in os.listdir(folder_path):
        os.remove(os.path.join(folder_path, file))

    # origin
    for subfolder in ["tile", "svs"]:
        folder_path = os.path.join(ORIGIN_DIR, subfolder)
        for file in os.listdir(folder_path):
            os.remove(os.path.join(folder_path, file))

    # result
    for subfolder in ["roi", "tile"]:
        folder_path = os.path.join(RESULT_DIR, subfolder)
        for file in os.listdir(folder_path):
            os.remove(os.path.join(folder_path, file))

    # test, train, val
    folders = [TEST_DIR, TRAIN_DIR, VAL_DIR]
    for folder in folders:
        for subfolder in ["images", "labels"]:
            folder_path = os.path.join(folder, subfolder)
            for file in os.listdir(folder_path):
                os.remove(os.path.join(folder_path, file))

def notify_application_server(request_data, settings):
    try:
        project_id = request_data["projectId"]
        application_server_url = f"{settings.APPLICATION_SERVER_URL}/api/model-server/projects/{project_id}/model-results"

        headers = {
            "Authorization": f"Bearer {settings.APPLICATION_SERVER_TOKEN}"
        }

        response = requests.post(application_server_url, json=request_data, headers=headers, timeout=10)

        if response.ok:
            print("응용 서버에 학습 결과 전송 성공")
        else:
            print(f"응용 서버 응답 오류: {response.status_code}, {response.text}")

    except Exception as e:
        print(f"Spring API 호출 실패: {str(e)}")