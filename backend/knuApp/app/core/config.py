from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:pass@db:5432/knudb"
    PROJECT_NAME: str = "KNU-NOTICE"

    class Config:
        env_file = ".env"

settings = Settings()