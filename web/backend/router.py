from typing import Optional
from fastapi import APIRouter

from config import settings
from web.backend.file_manager.s3_client import S3Client


class Router(APIRouter):
    def __init__(self):
        super().__init__()
        self.s3: Optional[S3Client] = S3Client(endpoint=settings.yandex_endpoint,
                                               access_key=settings.yandex_access_key,
                                               secret_key=settings.yandex_secret_key,
                                               bucket_name=settings.yandex_bucket_name)
