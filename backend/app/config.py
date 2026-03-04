from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./tutor.db"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-haiku-4-5-20251001"
    MAX_TOKENS_CONVERSATION: int = 1024
    MAX_TOKENS_EXPLANATION: int = 512

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
