import json
import time
import boto3
import threading
from .image_processor import process
from app import app

processing_lock = threading.Lock()
is_processing = False

def process_message():
    settings = app.state.settings
    # SQS 설정
    sqs = boto3.client("sqs", region_name=settings.AWS_REGION_NAME, aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                       aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)

    """
    SQS에서 메시지를 가져와서 처리 (추론 중이 아닐 때만 실행)
    """
    global is_processing

    while True:
        if not is_processing:  # 현재 모델이 사용 중이 아닐 때만 실행
            response = sqs.receive_message(
                QueueUrl=settings.AWS_SQS_URL,
                MaxNumberOfMessages=1
            )

            if "Messages" in response:
                message = response["Messages"][0]
                receipt_handle = message["ReceiptHandle"]
                request_data_list = json.loads(message["Body"])

                print("Received message:", request_data_list)

                with processing_lock:
                    is_processing = True

                # 모델 실행 (비동기 실행)
                print("process function call")
                time.sleep(5)
                # TODO process(request_data_list)

                with processing_lock:
                    is_processing = False

                # 메시지 삭제 (처리 완료 후)
                sqs.delete_message(QueueUrl=settings.AWS_SQS_URL, ReceiptHandle=receipt_handle)
                print("Processed & Deleted:", message["MessageId"])

        time.sleep(5)  # CPU 과부하 방지