import numpy as np
from models.whisper import WhisperModel
from schemas.radio import Transcript, WordTimestamp

async def transcribe_audio(audio_array: np.ndarray, sampling_rate: int = 16000) -> Transcript:
    pipe = WhisperModel.get_instance()
    
    result = pipe(
        {"array": audio_array, "sampling_rate": sampling_rate},
        generate_kwargs={"language": "english", "task": "transcribe"},
        chunk_length_s=30,
        batch_size=1,
    )
    
    words = []
    if "chunks" in result:
        for chunk in result["chunks"]:
            if chunk.get("timestamp") and chunk["timestamp"][0] is not None:
                # Handle cases where the end timestamp is None (e.g., very end of audio)
                end_time = chunk["timestamp"][1] if chunk["timestamp"][1] is not None else chunk["timestamp"][0] + 0.5
                words.append(WordTimestamp(
                    word=chunk["text"], 
                    start=chunk["timestamp"][0], 
                    end=end_time
                ))
                
    return Transcript(
        text=result["text"].strip(),
        confidence=1.0,  # Whisper doesn't expose per-sentence confidence natively via pipeline easily
        words=words
    )
