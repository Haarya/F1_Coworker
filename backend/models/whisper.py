from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import torch
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class WhisperModel:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            logger.info("Initializing Whisper model (this may take a while)...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if device == "cuda" else torch.float32
            
            try:
                model = AutoModelForSpeechSeq2Seq.from_pretrained(
                    settings.whisper_model,
                    torch_dtype=torch_dtype,
                    low_cpu_mem_usage=True,
                    use_safetensors=True,
                    token=settings.hf_token
                )
                model.to(device)
                
                processor = AutoProcessor.from_pretrained(
                    settings.whisper_model,
                    token=settings.hf_token
                )
                
                cls._instance = pipeline(
                    "automatic-speech-recognition",
                    model=model,
                    tokenizer=processor.tokenizer,
                    feature_extractor=processor.feature_extractor,
                    torch_dtype=torch_dtype,
                    device=device,
                    return_timestamps="word"
                )
                logger.info("Whisper model initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Whisper model: {e}")
                raise
        return cls._instance
