from fastapi import APIRouter, HTTPException
from schemas.analysis import StressResult
from pipelines.stress_analysis import analyze_stress
import librosa
import os

router = APIRouter(prefix="/api/v1/radio", tags=["radio"])

@router.get("/stress", response_model=StressResult)
async def get_driver_stress_mock(audioId: str = "sample_radio"):
    """
    Simulates fetching a driver's radio clip and extracting their stress emotion.
    Using the local sample file for demonstration since downloading HF audio 
    in real-time blocks the UI.
    """
    sample_file = os.path.join(os.path.dirname(__file__), "..", "sample_radio.mp3")
    if not os.path.exists(sample_file):
        raise HTTPException(status_code=404, detail="Sample audio file not found")
        
    try:
        # Load audio using librosa (16kHz standard for Wav2Vec2)
        audio_array, sr = librosa.load(sample_file, sr=16000)
        
        # Analyze it
        result = await analyze_stress(audio_array, sr)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}")

@router.get("/events")
async def get_radio_events(driver_id: str, gp: str):
    """
    Returns a list of radio transcript events for the race session.
    Reads from the Pyannote/WhisperX generated ML dataset.
    """
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "radio_ml_database.json")
    if os.path.exists(db_path):
        try:
            import json
            with open(db_path, "r") as f:
                db = json.load(f)
            # Use requested driver ID if exists, otherwise fallback to VER (our mock generated driver)
            if driver_id in db:
                return db[driver_id]
            elif "VER" in db:
                return db["VER"]
        except Exception as e:
            print(f"Failed to read ML dataset: {e}")
            
    # Fallback if DB doesn't exist yet
    return [
        {
            "id": f"{driver_id}_1",
            "timestamp": 10,
            "lapNumber": 1,
            "transcript": "Tyres feel good, pacing is okay.",
            "cognitiveLoad": 35.5
        }
    ]

