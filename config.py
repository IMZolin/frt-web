from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    yandex_access_key: str
    yandex_secret_key: str
    yandex_bucket_name: str
    yandex_endpoint: str
    db_url: str
    sentry_dsn: str


settings = Settings()
