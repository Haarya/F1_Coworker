from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InterceptStatus(BaseModel):
    active: bool
    cognitive_load: float
    speed: float
    sector: int
    message: Optional[str] = None
    triggered_at: Optional[datetime] = None

class LapPenalty(BaseModel):
    sector: int
    probability: float
    delta_seconds: float
    confidence: float
    features: List[str]
