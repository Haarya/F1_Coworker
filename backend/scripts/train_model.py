import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.compose import TransformedTargetRegressor
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import GroupKFold, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

def main():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "real_training_data.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    print("Loading data...")
    df = pd.read_csv(data_path)
    
    # We require race_id for GroupKFold
    if "race_id" not in df.columns:
        print("Error: Dataset is missing 'race_id' column for GroupKFold. Please regenerate training data.")
        return

    # Impute missing values
    df["tyre_compound"] = df["tyre_compound"].fillna("UNKNOWN")
    df["tyre_life"] = df["tyre_life"].fillna(1.0)
    df["track_status"] = df["track_status"].fillna("1")
    
    numeric_features = ["cognitive_load", "s_psych", "g_lat", "speed", "throttle",
                        "brake", "emotion_angry", "emotion_fearful", "sector", "lap_progress", "tyre_life"]
    categorical_features = ["tyre_compound", "track_status"]
    
    # Avoid SettingWithCopyWarning
    X = df[numeric_features + categorical_features].copy()
    for col in numeric_features:
        X[col] = X[col].fillna(0)
    
    y = df["delta_seconds"]
    groups = df["race_id"]

    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), categorical_features)
        ])

    # Model
    # HistGradientBoostingRegressor natively supports categorical features if we pass their indices.
    cat_indices = list(range(len(numeric_features), len(numeric_features) + len(categorical_features)))
    
    inner_model = HistGradientBoostingRegressor(
        categorical_features=cat_indices, 
        random_state=42
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

    param_grid = {
        'model__regressor__max_iter': [100, 200],
        'model__regressor__max_depth': [3, 5],
        'model__regressor__learning_rate': [0.01, 0.05]
    }

    print("Starting Grouped Grid Search for Hyperparameter Tuning...")
    # Use GroupKFold so laps from the same race stay together
    gkf = GroupKFold(n_splits=3)
    grid_search = GridSearchCV(pipeline, param_grid, cv=gkf, scoring='r2', n_jobs=-1, verbose=1)
    
    grid_search.fit(X, y, groups=groups)

    best_model = grid_search.best_estimator_
    best_cv_score = grid_search.best_score_
    
    print("\n--- Model Evaluation ---")
    print(f"Best Params: {grid_search.best_params_}")
    print(f"Best CV R2 Score (GroupKFold): {best_cv_score:.4f}")
    
    y_pred = best_model.predict(X)
    print(f"Overall Dataset R2 Score: {r2_score(y, y_pred):.4f}")
    print(f"Overall Dataset MAE: {mean_absolute_error(y, y_pred):.4f}")
    print(f"Overall Dataset RMSE: {np.sqrt(mean_squared_error(y, y_pred)):.4f}")

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "lap_penalty_model.joblib")
    joblib.dump(best_model, model_path)
    print(f"\nModel saved successfully to {model_path}")

if __name__ == "__main__":
    main()
