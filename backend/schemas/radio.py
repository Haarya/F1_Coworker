from pydantic import BaseModel
from typing import List, Optional

class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float

class Transcript(BaseModel):
    text: str
    confidence: float = 1.0
    words: List[WordTimestamp] = []
