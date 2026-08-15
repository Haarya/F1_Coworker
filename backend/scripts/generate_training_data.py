import json
import os
import gc
import torch
import librosa
import sys

# Add parent dir to path so we can import pipelines
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipelines.audio_diarization import DiarizationPipeline
from pipelines.stress_analysis import analyze_stress

def main():
    # In a real environment, this would pull from the Hugging Face F1 dataset.
    # For now, we simulate processing the `sample_radio.mp3` file.
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        print("WARNING: HF_TOKEN not set, Pyannote will fail. Please set it before running for real.")
        
    print("Starting F1 Training Data Generator Pipeline...")
    diarizer = DiarizationPipeline()
    
    # Process the sample radio clip
    audio_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_radio.mp3")
    if not os.path.exists(audio_path):
        print(f"Audio not found at {audio_path}")
        return
        
    try:
        labeled_segments = diarizer.process_audio(audio_path, hf_token, device="cuda", compute_type="int8")
        
        # Filter for Driver segments
        driver_segments = [s for s in labeled_segments if s.get("speaker_label") == "Driver"]
        
        results = []
        for idx, seg in enumerate(driver_segments):
            start = seg.get("start", 0)
            end = seg.get("end", 0)
            text = seg.get("text", "")
            
            # Crop audio for just the driver segment
            audio_array, sr = librosa.load(audio_path, sr=16000, mono=True, offset=start, duration=(end - start))
            
            # Analyze stress
            stress_result = analyze_stress(audio_array, sr)
            
            results.append({
                "id": f"VER_TEST_{idx}",
                "timestamp": int(start * 10), # scale to match telemetry timeline conceptually
                "lapNumber": 1,
                "transcript": f"[Driver]: {text.strip()}",
                "cognitiveLoad": stress_result["cognitive_load"],
                "emotions": stress_result["emotions"]
            })
            
            # Critical VRAM Management for 6GB RTX 4050
            del audio_array
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
        # Write to JSON
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        os.makedirs(data_dir, exist_ok=True)
        with open(os.path.join(data_dir, "radio_ml_database.json"), "w") as f:
            json.dump({"VER": results}, f, indent=2)
            
        print("Dataset generated successfully!")
        
    except Exception as e:
        print(f"Pipeline failed: {e}")

if __name__ == "__main__":
    main()
