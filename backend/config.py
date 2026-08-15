from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # ─── Hugging Face ───
    hf_token: str = ""                                  # Required — HF User Access Token
    dataset_name: str = "MikCil/f1-team-radio"
    sensevoice_model_dir: Path = Path("./models/sensevoice")
    
    # ─── FastF1 ───
    fastf1_cache_dir: Path = Path("./data/fastf1_cache")
    
    # ─── Server ───
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]
    
    # ─── ML ───
    cognitive_load_weights: dict = {
        "angry": 1.0,
        "fearful": 0.8,
        "sad": 0.6,
        "surprised": 0.4,
        "disgust": 0.3,
        "happy": 0.0,
        "neutral": 0.0,
    }
    
    # Cognitive G-Force separator alpha coefficient
    gforce_alpha: float = 0.3
    
    # Active Intercept thresholds
    intercept_cl_threshold: float = 80.0
    intercept_braking_threshold: float = 0.8  # brake pressure 0-1
    
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

settings = Settings()
