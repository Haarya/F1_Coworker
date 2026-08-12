import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

def main():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "real_training_data.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    print("Loading data...")
    df = pd.read_csv(data_path)
    features = ["cognitive_load", "s_psych", "g_lat", "speed", "throttle",
                "brake", "emotion_angry", "emotion_fearful", "sector", "lap_progress"]
                
    X = df[features].fillna(0)
    y = df["delta_seconds"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', GradientBoostingRegressor(random_state=42))
    ])

    param_grid = {
        'model__n_estimators': [100, 200, 300],
        'model__max_depth': [3, 5, 8],
        'model__learning_rate': [0.01, 0.05, 0.1]
    }

    print("Starting Grid Search for Hyperparameter Tuning...")
    grid_search = GridSearchCV(pipeline, param_grid, cv=3, scoring='r2', n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    y_pred = best_model.predict(X_test)

    print("\n--- Model Evaluation ---")
    print(f"Best Params: {grid_search.best_params_}")
    print(f"R2 Score: {r2_score(y_test, y_pred):.4f}")
    print(f"MAE: {mean_absolute_error(y_test, y_pred):.4f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "lap_penalty_model.joblib")
    joblib.dump(best_model, model_path)
    print(f"\nModel saved successfully to {model_path}")

if __name__ == "__main__":
    main()
