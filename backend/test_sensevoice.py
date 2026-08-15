import sys
from pathlib import Path

# Add backend parent directory to path so absolute imports (backend.x) work
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir.parent))

from backend.models.sensevoice import sensevoice_model

def test_model():
    audio_path = str(backend_dir / "sample_radio.mp3")
    if not Path(audio_path).exists():
        print(f"Error: {audio_path} does not exist.")
        return
        
    print(f"Testing SenseVoice on {audio_path}...")
    try:
        text, emotion = sensevoice_model.transcribe(audio_path)
        print(f"\n--- Result ---")
        print(f"Text:    {text}")
        print(f"Emotion: {emotion}")
        print(f"--------------\n")
    except Exception as e:
        print(f"Error during transcription: {e}")

if __name__ == "__main__":
    test_model()
