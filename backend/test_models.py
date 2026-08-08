import sys
import logging
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Test")

print("--- Testing Token Validity & Model Downloads ---")

try:
    from models.wav2vec2_emotion import EmotionModel
    logger.info("Triggering Emotion Model Download/Load...")
    emotion_pipe = EmotionModel.get_instance()
    logger.info("Emotion Model successfully loaded!")
except Exception as e:
    logger.error(f"Failed to load Emotion Model. Token invalid or network error: {e}")
    sys.exit(1)

try:
    from models.whisper import WhisperModel
    logger.info("Triggering Whisper Model Download/Load...")
    whisper_pipe = WhisperModel.get_instance()
    logger.info("Whisper Model successfully loaded!")
except Exception as e:
    logger.error(f"Failed to load Whisper Model: {e}")
    sys.exit(1)

print("All models successfully downloaded and loaded into memory!")
sys.exit(0)
