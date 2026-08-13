# F1 Dataset Pipeline (Diarization & Rate Limit Optimization) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely generate an accurate F1 telemetry dataset of ~2,000 to 3,000 clips on an RTX 4050 (6GB VRAM) by filtering for specific races (to bypass FastF1 rate limits) and running audio through a speaker diarization pipeline to ensure only the driver's stress is analyzed.

**Architecture:** 
1. `pre_cache_telemetry.py` will use a strict whitelist of 4 specific Grand Prix events, pulling their telemetry without triggering the FastF1 500 API calls/hour IP ban.
2. `generate_training_data.py` will filter the streaming Hugging Face dataset to only these 4 races. For each clip, it will run WhisperX/Pyannote to identify the Driver and Engineer, crop the audio to just the Driver, and feed that into Wav2Vec2. Memory management (`torch.cuda.empty_cache()`) and `int8` quantization will be strictly enforced to prevent the 6GB VRAM RTX 4050 from crashing.

**Tech Stack:** Python, FastF1, Hugging Face Datasets, Pyannote, WhisperX, Wav2Vec2, Pandas

## Global Constraints
- Target hardware is RTX 4050 with 6GB VRAM. Extreme memory optimization required.
- Do NOT modify existing model architectures in `audio_diarization.py` or `stress_analysis.py`, only orchestrate them.
- Ensure `dataset.cast_column("audio", Audio(decode=False))` is used everywhere to prevent Windows FFmpeg crashes.
- Dataset generator must still use `append_to_csv` for periodic saving every 100 clips.

---

### Task 1: Optimize Pre-Cacher with Rate Limit Whitelist

**Files:**
- Modify: `backend/scripts/pre_cache_telemetry.py`
- Test: `backend/tests/test_pre_cache_whitelist.py` (Create)

**Interfaces:**
- Consumes: `extract_unique_races`
- Produces: Target whitelist caching logic.

- [ ] **Step 1: Write the failing test**
```python
import pytest
from unittest.mock import patch, MagicMock

@patch('fastf1.get_session')
@patch('datasets.load_dataset')
def test_pre_cache_whitelist_filters_races(mock_load_dataset, mock_get_session):
    mock_dataset = [
        {'session_date': '2023-03-05', 'grand_prix': 'Bahrain'},
        {'session_date': '2022-09-11', 'grand_prix': 'Italy'}
    ]
    mock_load_dataset.return_value = mock_dataset
    
    from scripts.pre_cache_telemetry import extract_unique_races
    # Provide a whitelist to only allow Bahrain
    unique_races = extract_unique_races(mock_dataset, whitelist=[(2023, 'Bahrain')])
    
    assert len(unique_races) == 1
    assert (2023, 'Bahrain') in unique_races
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python -m pytest backend/tests/test_pre_cache_whitelist.py -v`
Expected: FAIL due to missing `whitelist` parameter or wrong logic.

- [ ] **Step 3: Write minimal implementation**
Modify `extract_unique_races` in `pre_cache_telemetry.py`:
```python
def extract_unique_races(dataset, whitelist=None):
    unique_races = set()
    for item in dataset:
        year_str = item.get('session_date', '')[:4]
        race_name = item.get('grand_prix')
        if year_str and race_name:
            race_tuple = (int(year_str), race_name)
            if whitelist is None or race_tuple in whitelist:
                unique_races.add(race_tuple)
    return unique_races
```
Modify `main()` to define a whitelist (e.g., `[(2023, 'Bahrain Grand Prix'), (2023, 'Monaco Grand Prix'), (2023, 'British Grand Prix'), (2023, 'São Paulo Grand Prix')]`) and pass it to the function.

- [ ] **Step 4: Run test to verify it passes**
Run: `python -m pytest backend/tests/test_pre_cache_whitelist.py -v`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/tests/test_pre_cache_whitelist.py backend/scripts/pre_cache_telemetry.py
git commit -m "fix: implement race whitelist to prevent fastf1 rate limit bans"
```

---

### Task 2: Integrate Diarization & VRAM Management in Dataset Generator

**Files:**
- Modify: `backend/scripts/generate_training_data.py`

**Interfaces:**
- Consumes: `DiarizationPipeline` from `pipelines.audio_diarization`

- [ ] **Step 1: Write integration logic**
Modify `generate_training_data.py` to:
1. Initialize `diarizer = DiarizationPipeline()` at the start.
2. In the iteration loop, check if the clip belongs to the race whitelist. If not, `continue`.
3. Save `raw_bytes` to a temp `.wav` file.
4. Call `labeled_segments = diarizer.process_audio(temp_path, hf_token, device="cuda", compute_type="int8")`.
5. Extract start and end times for the `"Driver"`.
6. Use `librosa.load` on the temp file to get the numpy array, crop it using the Driver timestamps (`start_idx = int(start * sr)`).
7. Pass the cropped driver audio to `analyze_stress`.
8. Delete temp file and call `torch.cuda.empty_cache()`.

- [ ] **Step 2: Implement VRAM safety hooks**
Ensure that after every 10 clips, `torch.cuda.empty_cache()` and python's `gc.collect()` are explicitly called to prevent the 6GB VRAM pool from fragmenting.

- [ ] **Step 3: Test execution logic**
Run: `python backend/scripts/generate_training_data.py --limit 2`
Expected: Processes exactly 2 clips, accurately invokes Gemini to label speakers, successfully isolates Driver audio, calculates stress, and writes to CSV without OOM crashes.

- [ ] **Step 4: Commit**
```bash
git add backend/scripts/generate_training_data.py
git commit -m "feat: integrate diarization pipeline and vram management for RTX 4050"
```
