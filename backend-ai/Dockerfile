# Python 베이스 이미지 사용
FROM python:3.10-slim

# 작업 디렉토리 생성 및 설정
WORKDIR /app

# requirements.txt 복사 후 패키지 설치
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 전체 소스 복사
COPY . .

ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Seoul

# uvicorn을 통해 FastAPI 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]