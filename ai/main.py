from app import app

@app.get("/")
def hello_world():
    return {"message": "FastAPI is running!"}
