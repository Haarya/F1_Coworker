# Dataset Generator Design Spec

## Goal
Generate a CSV dataset (`data/real_training_data.csv`) containing 100 perfectly aligned rows mapping historical telemetry and dynamic stress to a lap time penalty. This dataset will train the LSTM Lap Penalty Predictor.

## Input Data
1. **Audio Data**: 100 clips from `MikCil/f1-team-radio` (Hugging Face). Provides `audio`, `message_timestamp` (UTC), `session_date`, and `driver_name`.
2. **FastF1 Data**: Telemetry and lap times for the corresponding race sessions.

## Detailed Processing Steps

### 1. Data Fetching
- Load the first 100 clips from the Hugging Face dataset.
- Group the clips by race session (Year, GP) to minimize FastF1 API calls and heavily utilize the local FastF1 cache.

### 2. Audio & Stress Analysis
For each audio clip:
- Save the audio array to a temporary WAV file.
- Run Pyannote diarization to isolate the driver's voice.
- Run SenseVoiceSmall to get the discrete emotion tag (e.g. `<|ANGRY|>`).
- Run `librosa.feature.rms` to extract audio energy. Normalize it.
- Map the discrete tag to the `BASE_EMOTION_MAP` and multiply by the normalized energy to get the final `cognitive_load` and continuous emotion probabilities.

### 3. FastF1 Alignment & Feature Extraction
For each clip:
- Parse `session_date` and race location to load the correct FastF1 session (e.g. `fastf1.get_session()`).
- Find the **Current Lap**: Use `message_timestamp` to find which lap the driver was on. In FastF1, the `Date` column in the `laps` dataframe represents the UTC timestamp the lap was completed. Find the lap where `message_timestamp` is less than `Date` and greater than the previous lap's `Date`.
- Calculate the **Penalty (Label)**: Current lap time minus the driver's median lap time for that entire session.
- Get the **Previous Lap Telemetry (Features)**: Fetch telemetry (Speed, Throttle, Brake, nGear) for the lap *before* the current lap. Downsample this telemetry to a fixed sequence length (e.g., 300 frames) so the LSTM has consistent inputs. Serialize it to a JSON string.

### 4. CSV Export
Append the resulting row to `data/real_training_data.csv`.
Columns: `driver`, `year`, `gp`, `lap_number`, `cognitive_load`, `angry_prob`, `fearful_prob`, `happy_prob`, `sad_prob`, `neutral_prob`, `disgust_prob`, `surprised_prob`, `prev_lap_telemetry_json`, `lap_time_penalty`.

## Error Handling
- If FastF1 fails to load the session, skip the clip.
- If the `message_timestamp` is before Lap 2, skip (because we need *previous* lap telemetry).
- If the audio is corrupt or too short, skip.
