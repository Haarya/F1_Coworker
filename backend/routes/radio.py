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
            # Filter the flat list for the specific driver and gp
            driver_events = [e for e in db if e.get("driver_id") == driver_id and e.get("gp", "").title() == gp.title()]
            if driver_events:
                for idx, event in enumerate(driver_events):
                    event["id"] = f"{driver_id}_{idx}"
                    if "cognitive_load" in event:
                        event["cognitiveLoad"] = event.pop("cognitive_load")
                return driver_events
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

@router.get("/stress-for-driver")
async def get_stress_for_driver(driver_id: str):
    """
    Returns the latest pre-computed stress result for a driver from the DB.
    """
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "radio_ml_database.json")
    if os.path.exists(db_path):
        import json
        with open(db_path, "r") as f:
            db = json.load(f)
        events = [e for e in db if e.get("driver_id") == driver_id]
        if events:
            # Return a formatted StressResult
            latest = events[-1]
            return {
                "transcript": latest["transcript"],
                "cognitive_load": latest["cognitive_load"],
                "emotions": latest.get("emotions", {})
            }
    
    # Fallback
    return {
        "transcript": "Unknown",
        "cognitive_load": 50,
        "emotions": {"neutral": 1.0}
    }

@router.post("/execute-pipeline")
async def execute_pipeline():
    """
    Executes the ML pipeline (seeding script) as a background subprocess.
    This fulfills the UI's 'Execute' button action.
    """
    import subprocess
    import sys
    script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "seed_demo_data.py")
    try:
        # Run the seed script synchronously for the demo so UI waits for it
        result = subprocess.run([sys.executable, script_path], capture_output=True, text=True, check=True)
        return {"status": "ok", "message": "Pipeline execution complete.", "logs": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

