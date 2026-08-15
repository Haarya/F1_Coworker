from pydantic import BaseModel
from typing import List, Optional

class LapData(BaseModel):
    driver: str
    lap_number: int
    lap_time: float
    sector_1: Optional[float]
    sector_2: Optional[float]
    sector_3: Optional[float]

class TelemetryPoint(BaseModel):
    sessionTime: float
    speed: float
    throttle: float
    brake: float
    rpm: float
    x: float
    y: float
    gear: int
    
class TelemetryStream(BaseModel):
    driver: str
    lap_number: int
    data: List[TelemetryPoint]
