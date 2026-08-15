import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
import fastf1
import json
from datasets import load_dataset, Audio
from dotenv import load_dotenv
import librosa
import soundfile as sf
import tempfile
import torch
import warnings

if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Suppress fastf1 warnings for clean output
warnings.filterwarnings('ignore', category=FutureWarning)

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

from pipelines.audio_diarization import DiarizationPipeline
from config import settings

# Force fastf1 cache
settings.fastf1_cache_dir.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(settings.fastf1_cache_dir))

def main():
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        print("ERROR: HF_TOKEN not found in .env")
        return
        
    print("Loading Hugging Face dataset (this may take a moment)...")
    ds = load_dataset(settings.dataset_name, split="train", streaming=True, token=hf_token)
    ds = ds.cast_column("audio", Audio(decode=False))
    
    import itertools
    clips = []
    
    # Skip first 100, then take the next 100
    sliced_ds = itertools.islice(ds, 100, 200)
    for row in sliced_ds:
        clips.append(row)
            
    print(f"Loaded {len(clips)} clips.")
    
    print("Loading Pyannote Diarization pipeline...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipeline = DiarizationPipeline()
    
    output_rows = []
    
    # Group by session
    clips_by_session = {}
    for clip in clips:
        # Extract date from message_timestamp or date field
        msg_date_str = clip.get('session_date', clip.get('date'))
        if not msg_date_str:
            print(f"DEBUG: Skipping clip because no session_date/date found.")
            continue
        try:
            # We just need the YYYY-MM-DD
            session_date = str(msg_date_str).split('T')[0]
        except Exception as e:
            print(f"DEBUG: Skipping clip because date parsing failed: {e}")
            continue
            
        if session_date not in clips_by_session:
            clips_by_session[session_date] = []
        clips_by_session[session_date].append(clip)
        
    print(f"Grouped into {len(clips_by_session)} unique race sessions to optimize FastF1 fetching.")
        
    for session_date, session_clips in clips_by_session.items():
        print(f"\nProcessing session: {session_date} ({len(session_clips)} clips)")
        
        try:
            year = int(session_date[:4])
            schedule = fastf1.get_event_schedule(year)
            event = None
            session_date_pd = pd.to_datetime(session_date).tz_localize(None)
            
            for _, row in schedule.iterrows():
                if pd.notnull(row['EventDate']):
                    event_date = pd.to_datetime(row['EventDate']).tz_localize(None)
                    if abs((event_date - session_date_pd).days) <= 3:
                        event = row['EventName']
                        break
            
            if not event:
                print(f"  -> Could not match event for date {session_date}. Skipping.")
                continue
                
            print(f"  -> Fetching FastF1 data for {year} {event} (this uses local cache if available)...")
            f1_session = fastf1.get_session(year, event, 'R')
            # Load with telemetry and laps, but suppress print spam
            f1_session.load(telemetry=True, laps=True, messages=False)
        except Exception as e:
            print(f"  -> Failed to load FastF1 session: {e}")
            continue
            
        for clip in session_clips:
            try:
                # The dataset uses racing_number and driver_id
                driver_name = str(clip.get('racing_number', 'Unknown'))
                
                # We need the 3-letter code or number to pick the driver
                # Sometimes datasets contain just the TLA (e.g. VER)
                driver_laps = f1_session.laps.pick_driver(driver_name)
                if len(driver_laps) == 0:
                    print(f"  -> Skipped clip for {driver_name}: driver_laps length is 0 (FastF1 couldn't match or driver had no laps).")
                    continue
                    
                msg_timestamp = pd.to_datetime(clip.get('message_timestamp', clip.get('date')))
                msg_timestamp = msg_timestamp.tz_localize(None)
                
                current_lap = None
                for _, lap in driver_laps.iterrows():
                    if pd.notnull(lap.get('LapStartDate')):
                        lap_date = pd.to_datetime(lap['LapStartDate']).tz_localize(None)
                        if msg_timestamp >= lap_date:
                            current_lap = lap
                            
                if current_lap is None or current_lap['LapNumber'] < 2:
                    print(f"  -> Skipped clip for {driver_name}: Could not match message timestamp {msg_timestamp} to a valid lap.")
                    continue
                    
                prev_lap_num = current_lap['LapNumber'] - 1
                prev_lap = driver_laps[driver_laps['LapNumber'] == prev_lap_num]
                if len(prev_lap) == 0:
                    print(f"  -> Skipped clip for {driver_name}: Could not find previous lap (LapNumber {prev_lap_num})")
                    continue
                prev_lap = prev_lap.iloc[0]
                
                # Penalty = Current Lap Time - Median Lap Time
                median_lap = driver_laps['LapTime'].median()
                penalty = (current_lap['LapTime'] - median_lap).total_seconds()
                
                # Process audio
                audio_data = clip['audio']
                
                temp_wav = None
                is_temp = False
                
                if 'bytes' in audio_data and audio_data['bytes'] is not None:
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                        temp_wav = f.name
                    with open(temp_wav, "wb") as f_out:
                        f_out.write(audio_data['bytes'])
                    is_temp = True
                elif 'path' in audio_data and audio_data['path'] is not None:
                    temp_wav = audio_data['path']
                    is_temp = False
                else:
                    print(f"  -> Skipped clip for {driver_name}: Audio data format not supported.")
                    continue
                
                # Use pipeline
                labeled_segments = pipeline.process_audio(temp_wav, hf_token=hf_token, device=device)
                
                if is_temp:
                    os.remove(temp_wav)
                
                driver_segments = [s for s in labeled_segments if s.get('speaker_label') == 'Driver']
                if not driver_segments:
                    print(f"  -> Skipped clip for {driver_name}: No Driver audio detected by pipeline.")
                    continue
                    
                emotion = driver_segments[0].get('emotion', '<|NEUTRAL|>')
                
                # Extract telemetry
                tel = driver_laps[driver_laps['LapNumber'] == prev_lap_num].get_car_data()
                tel_dict = {
                    "Speed": tel['Speed'].tolist()[:300],
                    "Throttle": tel['Throttle'].tolist()[:300],
                    "Brake": tel['Brake'].tolist()[:300],
                    "nGear": tel['nGear'].tolist()[:300]
                }
                
                row = {
                    "driver": driver_name,
                    "session_date": session_date,
                    "lap_number": current_lap['LapNumber'],
                    "emotion": emotion,
                    "prev_lap_telemetry_json": json.dumps(tel_dict),
                    "lap_time_penalty": round(penalty, 3)
                }
                output_rows.append(row)
                print(f"  -> [+] Extracted Row: {driver_name} | Lap {current_lap['LapNumber']} | Emotion: {emotion} | Penalty: {round(penalty, 3)}s")
                
            except Exception as e:
                import traceback
                print(f"  -> Skipped clip for {driver_name} due to error: {e}")
                
    df = pd.DataFrame(output_rows)
    out_path = backend_dir / "data" / "real_training_data.csv"
    out_path.parent.mkdir(exist_ok=True)
    df.to_csv(out_path, mode='a', index=False, header=not out_path.exists())
    print(f"\nDataset fully generated! Successfully extracted {len(df)} rows.")
    print(f"Saved to {out_path}")

if __name__ == "__main__":
    main()
