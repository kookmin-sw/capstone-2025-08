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

# 대용량 이미지 처리 가능하도록 설정
Image.MAX_IMAGE_PIXELS = None  # DecompressionBombError 방지

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORIGIN_DIR = os.path.join(BASE_DIR, "../datasets/data/origin")
RESULT_DIR = os.path.join(BASE_DIR, "../datasets/data/result")
TEST_DIR = os.path.join(BASE_DIR, "../datasets/data/test")
TRAIN_DIR = os.path.join(BASE_DIR, "../datasets/data/train")
VAL_DIR = os.path.join(BASE_DIR, "../datasets/data/val")
MODEL_DIR = os.path.join(BASE_DIR, "../model")

def process(request_data_list):
    settings = app.state.settings

    # s3 초기화
    s3 = boto3.client("s3", region_name=settings.AWS_REGION_NAME, aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                      aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
    s3_bucket_name = settings.AWS_S3_BUCKET_NAME

    # 폴더 없으면 만들기
    print("폴더 없으면 만들기")
    ensure_dirs()

    # 기존에 폴더에 있는 이미지랑 모델 삭제 (process 종료 직전에 동일하게 진행하지만, 테스트 중에 혹시 삭제 안된 것들이 있을 수 있어서 코드 추가)
    print("기존에 폴더에 있는 이미지랑 모델 삭제")
    delete_files()

    # sqs 메시지에서 제시해준 모델을 로컬에 저장
    print("sqs 메시지에서 제시해준 모델을 로컬에 저장")
    download_model(s3, s3_bucket_name, request_data_list)

    # s3에서 svs 파일이랑 타일링 ROI 목록 로컬에 저장.
    print("s3에서 svs 파일이랑 타일링 ROI 목록 로컬에 저장")
    download_original_images(s3, s3_bucket_name, request_data_list)

    # roi 사진을 700 * 700 여러 개로 자르고 저장
    print("roi 사진을 700 * 700 여러 개로 자르고 저장")
    split_and_save_images(request_data_list)

    # 각 잘라진 사진 정보에 맞게 svs에서 해당 부분들 저장
    print("각 잘라진 사진 정보에 맞게 svs에서 해당 부분들 저장")
    extract_svs_regions()

    # test에 저장한 사진들을 train과 test로 복사하기
    print("test에 저장한 사진들을 train과 val로 복사")
    split_test_to_train_val()

    # 학습
    if request_data_list["type"] == "TRAINING_INFERENCE":
        print("학습")
        run_subprocess("train")
        upload_model(s3, s3_bucket_name, request_data_list['model_name'])

    # 추론
    print("추론")
    run_subprocess("predict")

    # 추론 결과물들을 원래 같았던 roi 끼리 합치기
    print("추론 결과물들을 원래 같았던 roi 끼리 합치기")
    merge_images()

    # 합친 roi들을 s3에 업로드
    print("합친 roi들을 s3에 업로드")
    upload_images(s3, s3_bucket_name, request_data_list)

    # 로컬에 다운받고 사용했던 이미지와 모델 삭제
    delete_files()

    # 응용 서버 호출
    notify_application_server(request_data_list, settings)

def ensure_dirs():
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

def download_model(s3, s3_bucket_name, request_data_list):
    s3_path = request_data_list["model_path"]
    save_path = os.path.join(MODEL_DIR, "checkpoints/model.pth")
    s3.download_file(s3_bucket_name, s3_path, save_path)

def download_original_images(s3, s3_bucket_name, request_data_list):
    # s3에서 svs 파일이랑 타일링 ROI 목록 로컬에 저장하기
    svs_s3_path = request_data_list["svs_path"]
    svs_save_path = os.path.join(ORIGIN_DIR, "svs") + "/basic.svs"
    s3.download_file(s3_bucket_name, svs_s3_path, svs_save_path)

    for idx, roi in enumerate(request_data_list["roi"], start=1):
        image_s3_path = roi["tissue_path"]
        name = os.path.basename(image_s3_path)
        image_save_path = os.path.join(ORIGIN_DIR, "tile") + "/" + name
        s3.download_file(s3_bucket_name, image_s3_path, image_save_path)

def split_and_save_images(request_data_list):
    tile_size = 700
    input_folder = os.path.join(ORIGIN_DIR, "tile")
    output_folder = os.path.join(TEST_DIR, "labels")

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".png"):
            image_path = os.path.join(input_folder, filename)
            image = Image.open(image_path)

            base_name = filename.rsplit(".")[0]
            orig_x = orig_y = None
            for image_info in request_data_list["roi"]:
                s3_path = image_info["tissue_path"]
                name = os.path.basename(s3_path)
                if filename == name:
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
                    tile_filename = f"{base_name}_{new_x}_{new_y}_anno.png"  # 원본 기준 좌표로 네이밍
                    tile_path = os.path.join(output_folder, tile_filename)
                    tile.save(tile_path)

def extract_svs_regions():
    labels_folder = os.path.join(TEST_DIR, "labels")
    svs_folder = os.path.join(ORIGIN_DIR, "svs")
    output_folder = os.path.join(TEST_DIR, "images")

    for filename in os.listdir(labels_folder):
        if filename.lower().endswith(".png"):
            name_without_ext = filename.rsplit(".", 1)[0]  # .png 제거
            base_name, x_str, y_str, _ = name_without_ext.rsplit("_", 3)
            x = int(x_str)
            y = int(y_str)
            label_image_path = os.path.join(labels_folder, filename)
            label_image = Image.open(label_image_path)
            tile_w, tile_h = label_image.size  # 잘라야 할 크기

            svs_path = get_latest_svs_file(svs_folder)
            slide = openslide.OpenSlide(svs_path)
            region = slide.read_region((x, y), level=0, size=(tile_w, tile_h))
            region = region.convert("RGB")  # RGBA -> RGB 변환

            output_image_path = os.path.join(output_folder, filename.replace("_anno", ""))
            region.save(output_image_path)
            slide.close()

# .svs 파일 중 가장 최근에 생성된 파일 경로 가져오기
def get_latest_svs_file(svs_folder):
    svs_files = glob.glob(os.path.join(svs_folder, "*.svs"))
    if not svs_files:
        return None  # svs 파일 없음
    # 최근 수정 시간 기준으로 정렬하여 가장 마지막 파일 선택
    latest_file = max(svs_files, key=os.path.getmtime)
    return latest_file

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

def run_subprocess(mode: str):
    """ 학습 또는 예측을 실행하는 함수 """
    command = get_command(mode)  # mode에 따라 명령어 가져오기
    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1
    )

    # 실시간으로 출력 읽기
    for line in iter(process.stdout.readline, ""):
        print(line, end="")  # 터미널에 출력

    stdout, stderr = process.communicate()  # 프로세스 종료 대기

    return stdout

# 학습 및 예측에 공통으로 사용하는 명령어 생성 함수
def get_command(mode: str):
    """ 학습(train) 또는 예측(predict) 명령어를 생성하는 함수 """

    if mode == "train":
        return [
            "python", os.path.join(BASE_DIR, "../model/main.py"),
            "--data_root", os.path.join(BASE_DIR, "../datasets/data"),
            "--dataset", "cityscapes",
            "--num_classes", "2",
            "--model", "deeplabv3plus_resnet101",
            "--total_itrs", "1000",
            "--gpu_id", "mps",
            "--crop_val",
            "--lr", "0.01",
            "--crop_size", "513",
            "--batch_size", "8",
            "--output_stride", "16",
            "--cmap_file", os.path.join(MODEL_DIR, "cmap.json"),
            "--num_classes", "2", # TODO 프론트가 주는 클래스 갯수, +1 (배경)
            "--gpu_id", "0",
        ]
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
            "--num_classes", "2", # TODO 여기에 프론트가 주는 클래스 갯수, +1 (배경)
        ]
    else:
        raise ValueError("Invalid mode: choose 'train' or 'predict'")

def get_latest_best_checkpoint(checkpoint_dir):
    """ 'best_'로 시작하는 .pth 파일 중 가장 최근에 수정된 파일 반환 """
    best_pth_files = glob.glob(os.path.join(checkpoint_dir, "best_*.pth"))

    if not best_pth_files:
        raise FileNotFoundError(f"체크포인트 폴더({checkpoint_dir})에 'best_'로 시작하는 .pth 파일이 없습니다!")

    latest_best_pth = max(best_pth_files, key=os.path.getmtime)
    return latest_best_pth

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

def upload_images(s3, s3_bucket_name, request_data_list):
    result_path = os.path.join(RESULT_DIR, "roi")
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}

    sub_project_id = request_data_list["sub_project_id"]
    annotation_history_id = request_data_list["annotation_history_id"]

    for filename in os.listdir(result_path):
        file_path = os.path.join(result_path, filename)

        if os.path.isfile(file_path):
            _, ext = os.path.splitext(filename)
            if ext.lower() in allowed_extensions:
                s3_key = (
                    f"sub-project/{sub_project_id}/"
                    f"annotation-history/{annotation_history_id}/"
                    f"inference/{filename}"
                )
                s3.upload_file(file_path, s3_bucket_name, s3_key)

def upload_model(s3, s3_bucket_name, model_name):
    checkpoint_dir = os.path.join(MODEL_DIR, "checkpoints")
    file_path = get_latest_best_checkpoint(checkpoint_dir)  # 최신 pth 파일 가져오기

    if os.path.isfile(file_path):
        s3_key = f"model/{model_name}"
        s3.upload_file(file_path, s3_bucket_name, s3_key)

def delete_files():
    print("Deleting local files")

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

def notify_application_server(request_data_list, settings):
    try:
        application_server_url = f"{settings.APPLICATION_SERVER_URL.rstrip('/')}/api/model-server/training/result"

        payload = {
            "sub_project_id": request_data_list["sub_project_id"],
            "annotation_history_id": request_data_list["annotation_history_id"],
            "model_path": request_data_list["model_path"],
            "roi": request_data_list["roi"]
        }

        headers = {
            "Authorization": f"Bearer {settings.APPLICATION_SERVER_TOKEN}"
        }

        response = requests.post(application_server_url, json=payload, headers=headers, timeout=5)

        if response.ok:
            print("응용 서버에 학습 결과 전송 성공")
        else:
            print(f"응용 서버 응답 오류: {response.status_code}, {response.text}")

    except Exception as e:
        print(f" Spring API 호출 실패 (무시됨): {str(e)}")

