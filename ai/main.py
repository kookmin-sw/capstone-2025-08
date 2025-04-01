import threading
from config import get_settings
from core.sqs import process_message
from app import app
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
