import sys
from pathlib import Path
import os
from dotenv import load_dotenv
import json

backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

from pipelines.audio_diarization import DiarizationPipeline

def test_pipeline():
    audio_path = str(backend_dir / "sample_radio.mp3")
    hf_token = os.getenv("HF_TOKEN")
    
    if not hf_token:
        print("Error: HF_TOKEN not found in .env")
        return
        
    pipeline = DiarizationPipeline()
    print(f"Testing full pipeline on {audio_path}...")
    
    try:
        labeled_segments = pipeline.process_audio(audio_path, hf_token=hf_token)
        print("\n--- Final Output ---")
        print(json.dumps(labeled_segments, indent=2))
        print("--------------------\n")
    except Exception as e:
        print(f"Error during pipeline execution: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pipeline()
