from transformers import pipeline
from config import settings
import logging
import torch

logger = logging.getLogger(__name__)

class EmotionModel:
    _instance = None
    LABEL_MAP = ["angry", "disgust", "fearful", "happy", "neutral", "sad", "surprised"]
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            logger.info("Initializing Wav2Vec2 Emotion model...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            try:
                cls._instance = pipeline(
                    "audio-classification",
                    model=settings.emotion_model,
                    token=settings.hf_token,
                    device=device,
                    top_k=None  # return all 7 emotion scores
                )
                logger.info("Wav2Vec2 Emotion model initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Emotion model: {e}")
                raise
        return cls._instance
