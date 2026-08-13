import os
import sys
import pytest
from unittest.mock import patch, MagicMock

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@patch('fastf1.get_session')
@patch('datasets.load_dataset')
def test_pre_cache_extracts_unique_races(mock_load_dataset, mock_get_session):
    # Mock huggingface dataset to return duplicate races
    mock_dataset = [
        {'session_date': '2023-03-05', 'grand_prix': 'Bahrain'},
        {'session_date': '2023-03-05', 'grand_prix': 'Bahrain'},
        {'session_date': '2022-09-11', 'grand_prix': 'Italy'}
    ]
    mock_load_dataset.return_value = mock_dataset
    
    mock_session = MagicMock()
    mock_get_session.return_value = mock_session
    
    from scripts.pre_cache_telemetry import extract_unique_races
    
    unique_races = extract_unique_races(mock_dataset)
    
    # Should only contain 2 unique races
    assert len(unique_races) == 2
    assert (2023, 'Bahrain') in unique_races
    assert (2022, 'Italy') in unique_races
