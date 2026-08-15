import os
import sys
import json
import fastf1

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from services.telemetry_service import TelemetryService

def main():
    print("Pre-caching FastF1 data for Bahrain 2024...")
    # This will download and cache the session to `data/fastf1_cache`
    TelemetryService.enable_cache()
    session = fastf1.get_session(2024, "Bahrain", 'R')
    session.load(telemetry=True, laps=True, weather=False)
    print("FastF1 cache populated.")
    
    drivers = ["VER", "HAM", "LEC", "NOR", "PIA"]
    
    events = []
    
    # Generate some realistic team radio exchanges
    base_events = [
        {"timestamp": 300, "transcript": "Okay mate, gap behind is 2.5 seconds. Mode 8.", "stress": 45, "emotion": "neutral"},
        {"timestamp": 900, "transcript": "Tyres are starting to drop off. Left front is grained.", "stress": 65, "emotion": "angry"},
        {"timestamp": 1500, "transcript": "Box box, we're going for the hard tyre.", "stress": 55, "emotion": "neutral"},
        {"timestamp": 2100, "transcript": "I have absolutely no grip! What is going on?", "stress": 85, "emotion": "angry"},
        {"timestamp": 2700, "transcript": "Keep your head down, you're doing a great job.", "stress": 40, "emotion": "happy"},
        {"timestamp": 3300, "transcript": "Car in front has a penalty, stay within 5 seconds.", "stress": 75, "emotion": "fearful"},
        {"timestamp": 4000, "transcript": "That's it mate, brilliant drive. P1!", "stress": 30, "emotion": "happy"},
    ]
    
    for driver in drivers:
        for idx, base in enumerate(base_events):
            events.append({
                "driver_id": driver,
                "gp": "Bahrain",
                "timestamp": base["timestamp"] + (idx * 15), # jitter
                "transcript": base["transcript"],
                "cognitive_load": base["stress"],
                "emotions": {
                    "angry": 0.8 if base["emotion"] == "angry" else 0.1,
                    "fearful": 0.7 if base["emotion"] == "fearful" else 0.1,
                    "sad": 0.0,
                    "happy": 0.9 if base["emotion"] == "happy" else 0.1,
                    "surprised": 0.0,
                    "neutral": 0.9 if base["emotion"] == "neutral" else 0.1,
                    "disgust": 0.0
                }
            })
            
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "radio_ml_database.json")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    with open(db_path, "w") as f:
        json.dump(events, f, indent=4)
        
    print(f"Generated {len(events)} radio events across {len(drivers)} drivers.")
    print("Demo Data Seeding Complete!")

if __name__ == "__main__":
    main()
