from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    plaid_client_id: str = ""
    plaid_secret: str = ""
    database_url: str = "sqlite:///./gropal.db"
    secret_key: str = "dev_secret_key_change_in_production"
    environment: str = "development"
    gemini_rate_limit_per_hour: int = 20

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
