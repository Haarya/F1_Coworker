import sys
from config import settings

print("Starting Verification...")
if not settings.hf_token or settings.hf_token == "PASTE_YOUR_TOKEN_HERE":
    print("FAILED: HF_TOKEN is missing or not updated.")
    sys.exit(1)
    
print("HF_TOKEN is properly set.")
print("Testing imports...")
try:
    from main import app
    from models.whisper import WhisperModel
    from models.wav2vec2_emotion import EmotionModel
    from pipelines.transcription import transcribe_audio
    from pipelines.stress_analysis import analyze_stress
    print("All backend imports successful!")
    sys.exit(0)
except Exception as e:
    print(f"FAILED: Import error - {e}")
    sys.exit(1)
