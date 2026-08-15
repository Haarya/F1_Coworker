import os
import csv
import random

def main():
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_training_data.csv")
    
    # Columns expected by train_model.py
    headers = [
        "race_id", "cognitive_load", "s_psych", "g_lat", "speed", "throttle", 
        "brake", "emotion_angry", "emotion_fearful", "sector", "lap_progress", 
        "tyre_life", "tyre_compound", "track_status", "delta_seconds"
    ]
    
    compounds = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"]
    track_statuses = ["1", "2", "4", "6", "7"]
    
    num_samples = 10000
    print(f"Generating {num_samples} synthetic samples...")
    
    with open(out_path, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for i in range(num_samples):
            # Base features
            race_id = f"race_{random.randint(1, 20)}"
            sector = random.randint(1, 3)
            lap_progress = random.uniform(0, 1)
            tyre_life = random.uniform(0.1, 1.0)
            tyre_compound = random.choice(compounds)
            track_status = random.choice(track_statuses)
            
            # Physics / State
            speed = random.uniform(80, 330)
            brake_prob = 0.8 if speed < 150 else (0.1 if speed > 250 else 0.4)
            brake = 1 if random.random() < brake_prob else 0
            throttle = 0 if brake else random.uniform(40, 100)
            g_lat = random.uniform(0, 5)
            
            # Psychology
            # Higher speed, low tyre life -> higher cognitive load
            cl_base = (speed / 330) * 40 + ((1.0 - tyre_life) * 30) + (g_lat * 5)
            cognitive_load = min(100.0, max(10.0, cl_base + random.uniform(-10, 20)))
            
            s_psych = random.uniform(0.1, 0.9)
            
            # Emotions follow CL
            if cognitive_load > 75:
                emotion_angry = random.uniform(0.4, 0.95)
                emotion_fearful = random.uniform(0.1, 0.4)
            elif cognitive_load > 50:
                emotion_angry = random.uniform(0.1, 0.5)
                emotion_fearful = random.uniform(0.0, 0.2)
            else:
                emotion_angry = random.uniform(0.0, 0.1)
                emotion_fearful = random.uniform(0.0, 0.1)
                
            # Delta seconds (Target Penalty)
            # We enforce a strict logical correlation so the model learns it flawlessly
            delta = 0.0
            
            if cognitive_load > 80:
                delta += random.uniform(0.3, 0.8)
            if emotion_angry > 0.7:
                delta += random.uniform(0.2, 0.5)
            if tyre_life < 0.3 and speed > 200:
                delta += random.uniform(0.1, 0.4)
            if track_status != "1": # Yellow/Red flags
                delta += random.uniform(0.0, 0.2)
                
            # Add some base noise so it isn't completely deterministic
            delta += random.uniform(0.0, 0.15)
            
            # Some samples are perfect laps
            if cognitive_load < 50 and tyre_life > 0.7:
                delta = 0.0
            
            writer.writerow([
                race_id, 
                round(cognitive_load, 2), 
                round(s_psych, 2), 
                round(g_lat, 2), 
                round(speed, 2), 
                round(throttle, 2), 
                brake, 
                round(emotion_angry, 3), 
                round(emotion_fearful, 3), 
                sector, 
                round(lap_progress, 3), 
                round(tyre_life, 2), 
                tyre_compound, 
                track_status, 
                round(delta, 3)
            ])
            
    print(f"Successfully generated 10,000 samples at: {out_path}")

if __name__ == "__main__":
    main()
