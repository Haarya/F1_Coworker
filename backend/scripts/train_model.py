import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.compose import TransformedTargetRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

def main():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_training_data.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    print("Loading data...")
    df = pd.read_csv(data_path)
    
    # Impute missing values
    df["tyre_compound"] = df["tyre_compound"].fillna("UNKNOWN")
    df["tyre_life"] = df["tyre_life"].fillna(1.0)
    df["track_status"] = df["track_status"].fillna("1")
    
    numeric_features = ["cognitive_load", "s_psych", "g_lat", "speed", "throttle",
                        "brake", "emotion_angry", "emotion_fearful", "sector", "lap_progress", "tyre_life"]
    categorical_features = ["tyre_compound", "track_status"]
    
    X = df[numeric_features + categorical_features].copy()
    for col in numeric_features:
        X[col] = X[col].fillna(0)
    
    y = df["delta_seconds"]

    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    # Standard GradientBoostingRegressor avoids joblib multiprocess crash in Python 3.14
    inner_model = GradientBoostingRegressor(
        random_state=42,
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05
    )

    # Wrap target with log1p
    model = TransformedTargetRegressor(
        regressor=inner_model,
        func=np.log1p,
        inverse_func=np.expm1
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model)
    ])

    print("Training GradientBoostingRegressor on 10,000 synthetic samples (Bypassing GridSearch for speed & stability)...")
    pipeline.fit(X, y)
    
    print("\n--- Model Evaluation ---")
    y_pred = pipeline.predict(X)
    print(f"Overall Dataset R2 Score: {r2_score(y, y_pred):.4f}")
    print(f"Overall Dataset MAE: {mean_absolute_error(y, y_pred):.4f}")
    print(f"Overall Dataset RMSE: {np.sqrt(mean_squared_error(y, y_pred)):.4f}")

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "lap_penalty_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved successfully to {model_path}")

if __name__ == "__main__":
    main()
