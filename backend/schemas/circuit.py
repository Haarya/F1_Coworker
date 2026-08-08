from pydantic import BaseModel
from typing import List

class CircuitCoordinate(BaseModel):
    x: float
    y: float
    sector: int
    is_heavy_braking: bool = False

class CircuitPath(BaseModel):
    circuit_name: str
    year: int
    coordinates: List[CircuitCoordinate]
