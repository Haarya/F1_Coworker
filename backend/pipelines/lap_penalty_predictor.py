import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from schemas.prediction import LapPenalty

class LapPenaltyPredictor:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
        
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def train_on_real_data(self):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "real_training_data.csv")
        if not os.path.exists(csv_path):
            print("Real training data not found. Falling back to mock data.")
            self.fit_mock_data()
            return

        try:
            df = pd.read_csv(csv_path)
            if df.empty or len(df) < 10:
                print("Real training data too small. Falling back to mock data.")
                self.fit_mock_data()
                return
                
            features = [
                "cognitive_load", "s_psych", "g_lat", "speed", "throttle",
                "brake", "emotion_angry", "emotion_fearful", "sector", "lap_progress", "jitter", "shimmer"
            ]
            
            # Fill missing features with 0
            for f in features:
                if f not in df.columns:
                    df[f] = 0.0
                    
            X = df[features].values
            y = df["delta_seconds"].values
            
            X_scaled = self.scaler.fit_transform(X)
            self.model.fit(X_scaled, y)
            self.is_trained = True
            print(f"Successfully trained Random Forest on {len(df)} real data samples.")
            
        except Exception as e:
            print(f"Failed to train on real data: {e}. Falling back to mock data.")
            self.fit_mock_data()

    def fit_mock_data(self):
        """
        Since we don't have a database of parsed radio events hooked up yet,
        we'll train a generic model on some synthetic F1 data representing typical
        stress to time-loss correlations.
        """
        # Synthetic feature matrix (100 samples)
        # Features: [cognitive_load, s_psych, g_lat, speed, throttle, brake, angry, fearful, sector, lap_progress, jitter, shimmer]
        np.random.seed(42)
        X = []
        y = []
        for _ in range(100):
            cl = np.random.uniform(20, 95)
            g_lat = np.random.uniform(0, 5)
            s_psych = max(0, cl - 0.3 * g_lat * 20)
            angry = np.random.uniform(0, 1)
            
            features = [
                cl,
                s_psych,
                g_lat,
                np.random.uniform(80, 320), # speed
                np.random.uniform(0, 100),  # throttle
                float(np.random.choice([0, 1])), # brake
                angry,
                np.random.uniform(0, 1), # fearful
                np.random.choice([1, 2, 3]), # sector
                np.random.uniform(0, 1), # lap_progress
                np.random.uniform(0, 0.1), # jitter
                np.random.uniform(0, 0.1), # shimmer
            ]
            X.append(features)
            
            # Target (delta time): heavily influenced by psychological stress and anger
            time_loss = (s_psych / 100) * 0.8 + (angry * 0.5) + np.random.normal(0, 0.1)
            y.append(max(0.0, time_loss))
            
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

    def predict(self, features: dict) -> LapPenalty:
        """Predict sector time penalty from current stress markers."""
        if not self.is_trained:
            self.train_on_real_data()
        
        X = np.array([[
            features.get("cognitive_load", 0),
            features.get("s_psych", 0),
            features.get("g_lat", 0),
            features.get("speed", 0),
            features.get("throttle", 0),
            features.get("brake", 0),
            features.get("emotion_angry", 0),
            features.get("emotion_fearful", 0),
            features.get("sector", 1),
            features.get("lap_progress", 0),
            features.get("jitter", 0),
            features.get("shimmer", 0),
        ]])
        
        X_scaled = self.scaler.transform(X)
        
        # Point prediction
        delta = self.model.predict(X_scaled)[0]
        
        # Estimate probability via tree vote distribution
        tree_predictions = np.array([tree.predict(X_scaled)[0] for tree in self.model.estimators_])
        probability = np.mean(tree_predictions > 0.05)  # % of trees predicting >50ms penalty
        confidence = 1.0 - np.std(tree_predictions) / (np.mean(np.abs(tree_predictions)) + 1e-6)
        
        # Feature importance for explainability
        importances = self.model.feature_importances_
        feature_names = [
            "cognitive_load", "s_psych", "g_lat", "speed", "throttle",
            "brake", "angry", "fearful", "sector", "lap_progress", "jitter", "shimmer"
        ]
        top_features = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:3]
        
        return LapPenalty(
            sector=int((features.get("sector", 1) % 3) + 1),
            probability=round(float(probability), 2),
            delta_seconds=round(float(max(0, delta)), 3),
            confidence=round(float(max(0, min(1, confidence))), 2),
            features=[f[0] for f in top_features],
        )
