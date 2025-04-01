import threading
from config import get_settings
from core.sqs import process_message
from app import app
import boto3
import json
import uuid
from fastapi import Request

@app.on_event("startup")
def startup_event():
    app.state.settings = get_settings()
    """FastAPI 서버 시작 시 백그라운드 태스크 실행"""
    start_background_task()

def start_background_task():
    """백그라운드에서 `process_message()` 실행"""
    thread = threading.Thread(target=process_message, daemon=True)
    thread.start()

@app.get("/")
def hello_world():
    return {"message": "FastAPI is running!"}

@app.get("/send")
def send_message():
    settings = app.state.settings
    sqs = boto3.client("sqs", region_name=settings.AWS_REGION_NAME, aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                       aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
    response = sqs.send_message(
        QueueUrl=settings.AWS_SQS_URL,
        MessageBody=json.dumps(
            '''
            {
              "model_url": "s3://pathos-images/model.pth",
              "svs_url": "s3://pathos-images/cells/TCGA-DM-A285-01Z-00-DX1.219e2829-8ffd-4b51-adce-cfd48293191b.svs",
              "images": [
                {
                  "tiled_png_url": "s3://pathos-images/test/1.png",
                  "roi": {
                    "x": 87341,
                    "y": 13016,
                    "width": 3276,
                    "height": 2415
                  }
                }
              ]
            }
            '''
        ),
        MessageGroupId="1",
        MessageDeduplicationId=str(uuid.uuid4())
    )
    print("Message Sent:", response["MessageId"])



@app.post("/send")
def send_message(request: Request):
    settings = app.state.settings

    # 요청 바디(JSON) 그대로 받기
    body = request.json()

    # boto3 클라이언트 생성
    sqs = boto3.client(
        "sqs",
        region_name=settings.AWS_REGION_NAME,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    # 메시지 전송
    response = sqs.send_message(
        QueueUrl=settings.AWS_SQS_URL,
        MessageBody=json.dumps(body),
        MessageGroupId="1",  # FIFO 큐일 경우
        MessageDeduplicationId=str(uuid.uuid4())
    )

    print("Message Sent:", response["MessageId"])
    return {"message_id": response["MessageId"]}