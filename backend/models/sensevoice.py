import sherpa_onnx
from pathlib import Path
from config import settings
import re
import librosa

class SenseVoiceModel:
    def __init__(self):
        model_dir = settings.sensevoice_model_dir
        if not model_dir.exists():
            raise FileNotFoundError(f"SenseVoice model not found at {model_dir}. Run scripts/download_sensevoice.py.")
            
        self.recognizer = sherpa_onnx.OfflineRecognizer.from_sense_voice(
            model=str(model_dir / "model.onnx"),
            tokens=str(model_dir / "tokens.txt"),
            num_threads=1,
            use_itn=True
        )
        
    def transcribe(self, audio_path: str):
        wave, sample_rate = librosa.load(audio_path, sr=16000, mono=True)
        stream = self.recognizer.create_stream()
        stream.accept_waveform(sample_rate, wave)
        
        self.recognizer.decode_stream(stream)
        result = stream.result.text
        
        tags = ["<|HAPPY|>", "<|SAD|>", "<|ANGRY|>", "<|NEUTRAL|>", "<|FEARFUL|>", "<|DISGUSTED|>", "<|SURPRISED|>"]
        
        emotion = "<|NEUTRAL|>"
        for tag in tags:
            if tag in result:
                emotion = tag
                break
                
        # Clean up text by removing all <|...|> tags
        text = re.sub(r'<\|.*?\|>', '', result).strip()
        
        return text, emotion

# Instantiate a singleton to be used across the app
sensevoice_model = SenseVoiceModel()
