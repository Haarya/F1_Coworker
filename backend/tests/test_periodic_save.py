import os
import sys
import pandas as pd
from unittest.mock import patch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_periodic_saving_writes_csv(tmp_path):
    from scripts.generate_training_data import append_to_csv
    
    csv_path = tmp_path / "test_data.csv"
    
    chunk_1 = [{"feature1": 1, "feature2": 2}]
    chunk_2 = [{"feature1": 3, "feature2": 4}]
    
    # First write (creates header)
    append_to_csv(chunk_1, str(csv_path))
    # Second write (appends)
    append_to_csv(chunk_2, str(csv_path))
    
    df = pd.read_csv(csv_path)
    assert len(df) == 2
    assert df.iloc[1]['feature1'] == 3
