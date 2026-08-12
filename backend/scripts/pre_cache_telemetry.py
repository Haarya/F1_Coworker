import os
import sys
import time
import fastf1
from datasets import load_dataset
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def extract_unique_races(dataset):
    unique_races = set()
    for item in dataset:
        year_str = item.get('session_date', '')[:4]
        race_name = item.get('grand_prix')
        if year_str and race_name:
            unique_races.add((int(year_str), race_name))
    return unique_races

def main():
    load_dotenv()
    cache_dir = str(settings.fastf1_cache_dir)
    os.makedirs(cache_dir, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
    
    hf_token = os.getenv("HF_TOKEN")
    print("Loading Hugging Face Dataset...")
    dataset = load_dataset(settings.dataset_name, split="train", streaming=True, token=hf_token)
    
    unique_races = extract_unique_races(dataset)
    print(f"Found {len(unique_races)} unique races to cache.")
    
    for year, race in unique_races:
        print(f"Caching telemetry for {year} {race}...")
        try:
            session = fastf1.get_session(year, race, 'R')
            session.load(telemetry=True, laps=True, weather=False, messages=False)
        except Exception as e:
            print(f"Failed to cache {year} {race}: {e}")
        time.sleep(10) # Strict 10-second pacing to avoid rate limit
        
if __name__ == "__main__":
    main()
