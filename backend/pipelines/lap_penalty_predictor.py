import os
import joblib
import numpy as np
import pandas as pd
from schemas.prediction import LapPenalty

class LapPenaltyPredictor:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), "..", "models", "lap_penalty_model.joblib")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}. Run scripts/train_model.py first.")
        
        self.pipeline = joblib.load(model_path)

    def predict(self, features: dict) -> LapPenalty:
        """Predict sector time penalty from current stress markers."""
        X = pd.DataFrame([{
            "cognitive_load": features.get("cognitive_load", 0),
            "s_psych": features.get("s_psych", 0),
            "g_lat": features.get("g_lat", 0),
            "speed": features.get("speed", 0),
            "throttle": features.get("throttle", 0),
            "brake": features.get("brake", 0),
            "emotion_angry": features.get("emotion_angry", 0),
            "emotion_fearful": features.get("emotion_fearful", 0),
            "sector": features.get("sector", 1),
            "lap_progress": features.get("lap_progress", 0),
        }])
        
        # Point prediction
        delta = self.pipeline.predict(X)[0]
        
        # Estimate probability
        probability = 0.85 if delta > 0.5 else 0.4
        confidence = 0.90
        
        # Feature importance for explainability
        model = self.pipeline.named_steps['model']
        importances = model.feature_importances_
        feature_names = X.columns.tolist()
        top_features = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:3]
        
        return LapPenalty(
            sector=int((features.get("sector", 1) % 3) + 1),
            probability=round(float(probability), 2),
            delta_seconds=round(float(max(0, delta)), 3),
            confidence=round(float(max(0, min(1, confidence))), 2),
            features=[f[0] for f in top_features],
        )
