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
import argparse
import librosa
from datasets import load_dataset, Audio
from pipelines.stress_analysis import analyze_stress
from pipelines.cognitive_gforce import compute_lateral_g, compute_psychological_frustration
from schemas.telemetry import TelemetryPoint
from config import settings

async def main(max_clips: int):
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
    loaded_telemetry = {}
    
    print(f"Processing up to {max_clips} audio clips...")
    count = 0
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
            session_key_driver = f"{year}_{race_name}_{racing_number}"
            if session_key_driver not in loaded_telemetry:
                try:
                    loaded_telemetry[session_key_driver] = session.laps.pick_driver(racing_number).get_telemetry()
                except Exception as e:
                    print(f"Telemetry missing for {racing_number}: {e}")
                    continue
                    
            car_data = loaded_telemetry[session_key_driver]
            if car_data is None or car_data.empty:
                continue
                
            if 'Date' not in car_data.columns:
                continue

            # Ensure Date column is timezone aware to compare with clip_time_utc
            if car_data['Date'].dt.tz is None:
                car_data['Date'] = car_data['Date'].dt.tz_localize('UTC')
                
            # Find the closest telemetry row
            time_diffs = abs(car_data['Date'] - clip_time_utc)
            if time_diffs.min() > pd.Timedelta(minutes=5):
                continue # Clip time is too far from any telemetry
                
            closest_idx_label = time_diffs.idxmin()
            closest_iloc = car_data.index.get_loc(closest_idx_label)
            point = car_data.iloc[closest_iloc]
            
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
            
            # 5. Calculate true physics features
            # Compute Lap Progress
            lap_dur = current_lap['LapTime'].total_seconds()
            if lap_dur > 0:
                lap_prog = (point_time_td.total_seconds() - current_lap['LapStartTime'].total_seconds()) / lap_dur
            else:
                lap_prog = 0.5
            lap_prog = max(0.0, min(1.0, lap_prog))
            
            # Compute G-Lat using 5-point window
            window_start = max(0, closest_iloc - 2)
            window_end = min(len(car_data), closest_iloc + 3)
            window_df = car_data.iloc[window_start:window_end]
            
            telemetry_points = []
            for _, r in window_df.iterrows():
                telemetry_points.append(TelemetryPoint(
                    time=r['Time'].total_seconds(),
                    speed=float(r['Speed']),
                    throttle=float(r['Throttle']),
                    brake=float(r['Brake']),
                    rpm=float(r['RPM']),
                    x=float(r['X']),
                    y=float(r['Y']),
                    gear=int(r['nGear'])
                ))
                
            g_lat_values = compute_lateral_g(telemetry_points, window_size=5)
            g_lat = g_lat_values[len(g_lat_values)//2] if g_lat_values else 0.0
            
            # Compute true psychological frustration
            s_psych = compute_psychological_frustration(stress_result.cognitive_load, g_lat)
            
            row = {
                "cognitive_load": stress_result.cognitive_load,
                "s_psych": float(s_psych),
                "g_lat": float(g_lat),
                "speed": float(point['Speed']),
                "throttle": float(point['Throttle']),
                "brake": float(point['Brake']),
                "emotion_angry": stress_result.emotions.angry,
                "emotion_fearful": stress_result.emotions.fearful,
                "sector": int(pd.notna(current_lap['Sector1Time'])) + 1,
                "lap_progress": float(lap_prog),
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
    parser = argparse.ArgumentParser(description="Generate F1 Training Data")
    parser.add_argument("--limit", type=int, default=2000, help="Max clips to process")
    args = parser.parse_args()
    asyncio.run(main(args.limit))
