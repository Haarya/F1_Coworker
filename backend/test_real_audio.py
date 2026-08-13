import os
if hasattr(os, "symlink"):
    del os.symlink
import json
from pipelines.audio_diarization import DiarizationPipeline
from dotenv import load_dotenv

def main():
    load_dotenv()
    hf_token = os.getenv("HF_TOKEN")
    
    if not hf_token:
        print("Error: HF_TOKEN not found in .env file.")
        return

    # Replace this with the path to a real F1 radio .wav or .mp3 file you download
    audio_file_path = "sample_radio.mp3"
    
    if not os.path.exists(audio_file_path):
        print(f"Error: Could not find '{audio_file_path}'. Please place an audio file in this directory.")
        return

    print("Initializing pipeline... (This might take a while on first run as it downloads models)")
    pipeline = DiarizationPipeline()
    
    print("Processing audio...")
    try:
        results = pipeline.process_audio(audio_path=audio_file_path, hf_token=hf_token)
        
        print("\n--- RESULTS ---")
        print(json.dumps(results, indent=2))
        
    except ImportError:
        print("\nError: whisperx is not installed. You must install the full heavy requirements to run the real models:")
        print("pip install whisperx")

if __name__ == "__main__":
    main()
