# CPU-Optimized ML Pipeline Design Spec (v2)

## Problem
The current backend runs 5 ML models sequentially, requiring ~5GB VRAM. It cannot run on CPU in practice. Additionally, the initial plan suffered from dataset alignment issues, data leakage in the LSTM, static emotion variance, and unrealistic CPU compute loads for dataset generation.

## Solution
Replace the audio pipeline with **SenseVoiceSmall via Sherpa-ONNX** (transcription + emotion), keep **Pyannote** (diarization), keep **Gemini API** (speaker role). Replace the sklearn lap penalty predictor with a **lightweight LSTM** trained on *previous* telemetry sequences + dynamic emotion data. Limit local dataset generation to 100 clips for computational feasibility.

## New Pipeline (4 components, CPU-only)

### 1. Pyannote Diarization (unchanged)
- **Input:** Raw audio
- **Output:** Speaker segments (timestamps)
- Runs on CPU (PyTorch). 

### 2. SenseVoiceSmall (Sherpa-ONNX)
- **Input:** Raw audio array (16kHz, mono) for each Pyannote segment
- **Output:** Transcription text + discrete emotion tag
- **CPU inference:** ~2-5 seconds for a 30-second clip

### 3. Gemini API — Speaker Role Classification (unchanged)
- **Input:** Transcript segments
- **Output:** Speaker labels (Driver/Engineer)

### 4. Dataset Generator (Updated)
- **Purpose:** Train the LSTM by mapping stress to lap penalties, without data leakage.
- **Scope:** Process only the first **100 clips** from `MikCil/f1-team-radio` to ensure realistic local CPU runtime.
- **Detailed Process:**
  1. **Download 100 Clips:** Fetch the first 100 clips from `MikCil/f1-team-radio`.
  2. **Timestamp Alignment:** Use the `message_timestamp` (UTC) and `session_date` variables provided in the dataset to precisely align the audio with FastF1's telemetry timestamps (`session.pos_data` or lap timing). 
  3. **Emotion Variance:** Run Pyannote + SenseVoiceSmall. Map the discrete tag to the baseline emotion dictionary. Extract **RMS Energy** and **Pitch** from the raw audio using `librosa`. Multiply the baseline scores by the normalized energy/pitch to generate a continuous, dynamic probability distribution for stress.
  4. **Avoid Data Leakage:** Query FastF1 for the *previous* lap's telemetry features (to avoid feeding the model the lap it's trying to predict) and the *current* lap's time penalty. 
  5. **Data Export:** Output historical telemetry, dynamic stress features, and the calculated penalty into `data/real_training_data.csv`.

### 5. LSTM Lap Penalty Predictor
- **Input:** Sequence of *previous lap* telemetry frames (speed, throttle, brake) + *current* dynamic emotion scores.
- **Output:** Predicted current lap time penalty (delta seconds).
- **Architecture:** 2-layer LSTM (hidden_size=64) → Linear head.
- **Size:** ~500KB.

## Emotion Score Mapping
```python
BASE_EMOTION_MAP = {
    "<|HAPPY|>": {"happy": 0.9, "neutral": 0.1},
    "<|SAD|>": {"sad": 0.9, "neutral": 0.1},
    "<|ANGRY|>": {"angry": 0.9, "fearful": 0.1},
    "<|NEUTRAL|>": {"neutral": 0.95, "happy": 0.05},
    "<|FEARFUL|>": {"fearful": 0.85, "angry": 0.15},
    "<|DISGUSTED|>": {"disgust": 0.9, "angry": 0.1},
    "<|SURPRISED|>": {"surprised": 0.85, "fearful": 0.15},
}
# Final Score = BASE_EMOTION_MAP[tag] * normalized_audio_energy
```

## Files Changed

### New Files
- `backend/models/sensevoice.py`
- `backend/models/lstm_penalty.py`
- `backend/scripts/train_lstm.py`
- `backend/scripts/generate_training_data.py`
- `backend/scripts/download_sensevoice.py`

### Modified Files
- `backend/pipelines/stress_analysis.py` (Add audio energy extraction for variance)
- `backend/pipelines/audio_diarization.py`
- `backend/pipelines/transcription.py`
- `backend/pipelines/lap_penalty_predictor.py`
- `backend/config.py`
- `backend/requirements.txt` (Add `sherpa-onnx`, `librosa`)

### Deleted Files
- `backend/models/wav2vec2_emotion.py`
- `backend/models/whisper.py`
