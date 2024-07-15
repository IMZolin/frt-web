from pydantic import BaseSettings


class Settings(BaseSettings):
    yandex_access_key: str
    yandex_secret_key: str
    yandex_bucket_name: str
    yandex_endpoint: str

    class Config:
        env_file = ".env"


settings = Settings()
