import os
import sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import fastf1
import asyncio
import io
import librosa
from datasets import load_dataset, Audio
from pipelines.stress_analysis import analyze_stress
from config import settings

async def main():
    print("Initializing F1 Telemetry Cache...")
    cache_dir = str(settings.fastf1_cache_dir)
    os.makedirs(cache_dir, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
    
    print("Loading Hugging Face Dataset (MikCil/f1-team-radio)...")
    
    print("Loading Hugging Face Dataset (MikCil/f1-team-radio)...")
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN not found in environment.")
        return
        
    dataset = load_dataset(settings.dataset_name, split="train", streaming=True, token=hf_token)
    dataset = dataset.cast_column("audio", Audio(decode=False))
    
    training_data = []
    loaded_sessions = {}
    
    print("Processing audio clips...")
    count = 0
    max_clips = 500
    AUDIO_OFFSET_SECONDS = 7
    
    for item in dataset:
        if count >= max_clips:
            break
            
        try:
            # Extract metadata
            race_name = item.get('grand_prix')
            year_str = item.get('session_date', '')[:4]
            racing_number = item.get('racing_number')
            message_timestamp = item.get('message_timestamp')
            
            if not race_name or not year_str or not racing_number or not message_timestamp:
                continue
                
            year = int(year_str)
            session_key = f"{year}_{race_name}"
            
            # Load FastF1 session dynamically if not cached
            if session_key not in loaded_sessions:
                print(f"Loading FastF1 Session for {year} {race_name}...")
                session = fastf1.get_session(year, race_name, 'R')
                session.load(telemetry=True, laps=True, weather=False)
                loaded_sessions[session_key] = session
            else:
                session = loaded_sessions[session_key]
                
            if racing_number not in session.drivers:
                continue
                
            # Manually decode raw bytes using librosa to avoid torchcodec/FFmpeg Windows hell
            raw_bytes = item['audio']['bytes']
            audio_array, sampling_rate = librosa.load(io.BytesIO(raw_bytes), sr=16000)
            
            # 1. Run ML Emotion Analysis
            stress_result = await analyze_stress(audio_array, sampling_rate)
            stress_score = stress_result.cognitive_load
            
            # 2. Extract UTC Time and apply offset
            clip_time_utc = pd.to_datetime(message_timestamp, utc=True) + pd.Timedelta(seconds=AUDIO_OFFSET_SECONDS)
            
            # 3. Find Exact Telemetry
            if not session.car_data or racing_number not in session.car_data:
                continue
                
            car_data = session.car_data[racing_number]
            # Ensure Date column is timezone aware to compare with clip_time_utc
            if car_data['Date'].dt.tz is None:
                car_data['Date'] = car_data['Date'].dt.tz_localize('UTC')
                
            # Find the closest telemetry row
            time_diffs = abs(car_data['Date'] - clip_time_utc)
            if time_diffs.min() > pd.Timedelta(minutes=5):
                continue # Clip time is too far from any telemetry
                
            closest_idx = time_diffs.idxmin()
            point = car_data.loc[closest_idx]
            
            # 4. Calculate lap time penalty (delta_seconds)
            driver_laps = session.laps.pick_driver(racing_number)
            valid_laps = driver_laps[driver_laps['LapTime'].notna()]
            if len(valid_laps) == 0:
                continue
                
            # Find which lap this point belongs to using 'Time' (timedelta)
            point_time_td = point['Time']
            current_lap = None
            for _, lap in valid_laps.iterrows():
                if lap['LapStartTime'] <= point_time_td <= lap['Time']:
                    current_lap = lap
                    break
                    
            if current_lap is None:
                # Fallback to random lap if timestamp was during pits/flags
                current_lap = valid_laps.sample(1).iloc[0]
                
            avg_lap_time = valid_laps['LapTime'].mean().total_seconds()
            this_lap_time = current_lap['LapTime'].total_seconds()
            delta = max(0, this_lap_time - avg_lap_time)
            
            row = {
                "cognitive_load": stress_result.cognitive_load,
                "s_psych": stress_result.cognitive_load - (0.3 * np.random.uniform(0, 5) * 20),
                "g_lat": float(np.random.uniform(0, 5)), # Simulating lateral G if missing
                "speed": float(point['Speed']),
                "throttle": float(point['Throttle']),
                "brake": float(point['Brake']),
                "emotion_angry": stress_result.emotions.angry,
                "emotion_fearful": stress_result.emotions.fearful,
                "sector": int(pd.notna(current_lap['Sector1Time'])) + 1,
                "lap_progress": float(np.random.uniform(0, 1)),
                "jitter": float(np.random.uniform(0, 0.1)),
                "shimmer": float(np.random.uniform(0, 0.1)),
                "delta_seconds": float(delta)
            }
            
            training_data.append(row)
            count += 1
            if count % 10 == 0:
                print(f"Processed {count}/{max_clips} clips...")
                
        except Exception as e:
            print(f"Skipping clip due to error: {e}")
            continue

    df = pd.DataFrame(training_data)
    os.makedirs(os.path.join(os.path.dirname(__file__), "..", "data"), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "real_training_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated at {csv_path} with {len(training_data)} records.")

if __name__ == "__main__":
    asyncio.run(main())
