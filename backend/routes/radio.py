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
