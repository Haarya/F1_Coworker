import numpy as np
import librosa
from ..models.wav2vec2_emotion import EmotionModel
from ..schemas.analysis import StressResult, EmotionScores
from ..config import settings

async def analyze_stress(audio_array: np.ndarray, sampling_rate: int = 16000) -> StressResult:
    pipe = EmotionModel.get_instance()
    
    # Wav2Vec2 expects 16kHz input
    if sampling_rate != 16000:
        audio_array = librosa.resample(y=audio_array, orig_sr=sampling_rate, target_sr=16000)
    
    raw_results = pipe({"array": audio_array, "sampling_rate": 16000})
    
    # Build emotion scores dict from list of dicts: [{'label': 'angry', 'score': 0.9}, ...]
    emotions_dict = {r["label"]: r["score"] for r in raw_results}
    
    # Fill missing with 0.0 just in case
    for label in EmotionModel.LABEL_MAP:
        if label not in emotions_dict:
            emotions_dict[label] = 0.0
            
    emotions = EmotionScores(**emotions_dict)
    
    # Calculate Cognitive Load Index (0-100)
    weights = settings.cognitive_load_weights
    raw_score = sum(emotions_dict.get(emotion, 0.0) * weight for emotion, weight in weights.items())
    cl_index = min(100.0, max(0.0, raw_score * 100.0))
    
    # Determine stress zone
    if cl_index <= 30:
        zone = "optimal"
    elif cl_index <= 60:
        zone = "elevated"
    else:
        zone = "overload"
    
    return StressResult(
        emotions=emotions,
        cognitive_load=round(cl_index, 1),
        zone=zone
    )
