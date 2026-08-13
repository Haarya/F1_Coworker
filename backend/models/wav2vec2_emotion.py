from transformers import Wav2Vec2FeatureExtractor, AutoModelForAudioClassification
from config import settings
import logging
import torch

logger = logging.getLogger(__name__)

class EmotionModel:
    _model = None
    _processor = None
    LABEL_MAP = ["angry", "disgust", "fearful", "happy", "neutral", "sad", "surprised"]
    
    @classmethod
    def get_instance(cls):
        if cls._model is None:
            logger.info("Initializing Wav2Vec2 Emotion model (bypassing torchaudio)...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            try:
                # Bypass the pipeline to prevent libtorchcodec DLL errors on Windows
                cls._processor = Wav2Vec2FeatureExtractor.from_pretrained(
                    settings.emotion_model, 
                    token=settings.hf_token
                )
                cls._model = AutoModelForAudioClassification.from_pretrained(
                    settings.emotion_model, 
                    token=settings.hf_token
                )
                cls._model.eval()
                cls._model.to(device)
                
                logger.info("Wav2Vec2 Emotion model initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Emotion model: {e}")
                raise
                
        def inference(audio_input):
            # Mimic Hugging Face pipeline output dictionary structure
            array = audio_input["array"]
            sr = audio_input["sampling_rate"]
            
            # FeatureExtractor does not use torchaudio
            inputs = cls._processor(array, sampling_rate=sr, return_tensors="pt")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                logits = cls._model(**inputs).logits
                
            scores = torch.nn.functional.softmax(logits, dim=-1).squeeze().tolist()
            labels = list(cls._model.config.id2label.values())
            
            # Sometimes single item lists break enumerate if squeezed entirely (not usually for 7 classes, but safe)
            if not isinstance(scores, list):
                scores = [scores]
                
            return [{"label": labels[i], "score": score} for i, score in enumerate(scores)]
            
        return inference
