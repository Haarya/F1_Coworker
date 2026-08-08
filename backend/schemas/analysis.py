from pydantic import BaseModel
from typing import Optional

class EmotionScores(BaseModel):
    angry: float
    disgust: float
    fearful: float
    happy: float
    neutral: float
    sad: float
    surprised: float

class StressResult(BaseModel):
    emotions: EmotionScores
    cognitive_load: float
    zone: str  # "optimal", "elevated", "overload"
