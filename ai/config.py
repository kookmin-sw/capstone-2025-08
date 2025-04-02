from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """AWS 토큰을 환경 변수에서 불러오는 설정 클래스"""
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION_NAME: str
    AWS_SQS_URL: str
    AWS_S3_BUCKET_NAME: str

    class Config:
        env_file = ".env"  # .env 파일에서 환경 변수 로드

@lru_cache()  # 캐싱하여 여러 요청에서도 불필요한 재로딩 방지
def get_settings():
    """환경 변수 캐싱하여 FastAPI에서 효율적으로 사용"""
    return Settings()
