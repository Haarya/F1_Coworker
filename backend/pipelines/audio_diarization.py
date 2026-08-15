import os
import torch
from pyannote.audio import Pipeline
import librosa
import tempfile
import soundfile as sf
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))
from models.sensevoice import sensevoice_model
class DiarizationPipeline:
    def __init__(self):
        self.engineer_keywords = ["box", "mode", "strat", "copy", "delta", "pit", "drinks", "water", "check"]

    def llm_classify_speakers(self, segments):
        # Prepare transcript text
        transcript_lines = []
        current_speaker = None
        current_text = []
        
        for seg in segments:
            speaker = seg.get("speaker", "Unknown")
            text = seg.get("text", "").strip()
            if not text: continue
            
            if speaker != current_speaker:
                if current_speaker is not None:
                    transcript_lines.append(f"{current_speaker}: {' '.join(current_text)}")
                current_speaker = speaker
                current_text = [text]
            else:
                current_text.append(text)
                
        if current_speaker is not None:
            transcript_lines.append(f"{current_speaker}: {' '.join(current_text)}")
            
        full_transcript = "\n".join(transcript_lines)
        print("--- Full Transcript ---")
        print(full_transcript)
        
        # Call Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found. Defaulting to 'Unknown' labels.")
            return segments
            
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are an expert Formula 1 analyst. Read the following radio transcription and identify which speaker is the 'Driver' and which is the 'Engineer'.
The Driver is in the car and usually reports issues with the car (like drinks, tires, or steering).
The Engineer sits on the pit wall, checks telemetry, and gives instructions or confirmations.

Transcript:
{full_transcript}

Analyze the context and return ONLY a valid JSON object mapping the speaker IDs to their roles. 
Example format: {{"SPEAKER_00": "Driver", "SPEAKER_01": "Engineer"}}"""

        import time
        max_retries = 5
        print("7. Classifying speakers with Gemini API...")
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                import json
                mapping = json.loads(response.text)
                print("Speaker Mapping:", mapping)
                
                # Apply labels
                result = []
                for seg in segments:
                    new_seg = dict(seg)
                    speaker = new_seg.get("speaker")
                    new_seg["speaker_label"] = mapping.get(speaker, "Unknown")
                    result.append(new_seg)
                return result
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    if attempt < max_retries - 1:
                        print(f"LLM Rate limit hit. Sleeping for 62 seconds... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(62)
                        continue
                print(f"LLM Classification failed: {e}")
                return segments

    def process_audio(self, audio_path, hf_token, device="cpu", compute_type="int8"):
        print("1. Loading Pyannote Diarization model... (This downloads the speaker model using your HF Token)")
        diarize_pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", token=hf_token)
        if device == "cuda" and torch.cuda.is_available():
            diarize_pipeline.to(torch.device("cuda"))
        
        print("2. Diarizing audio (Finding who spoke when)...")
        audio, sr = librosa.load(audio_path, sr=16000, mono=True)
        # pyannote expects shape (channels, samples) as torch tensor
        audio_tensor = torch.from_numpy(audio).unsqueeze(0)
        diarization = diarize_pipeline({"waveform": audio_tensor, "sample_rate": 16000}, min_speakers=2, max_speakers=2)
        
        print("3. Transcribing segments with SenseVoice...")
        segments = []
        
        # Handle different pyannote.audio versions
        if hasattr(diarization, "itertracks"):
            iterator = diarization.itertracks(yield_label=True)
        else:
            iterator = diarization.speaker_diarization.itertracks(yield_label=True)
            
        for turn, _, speaker in iterator:
            start = turn.start
            end = turn.end
            # Extract audio chunk
            start_sample = int(start * 16000)
            end_sample = int(end * 16000)
            chunk = audio[start_sample:end_sample]
            
            if len(chunk) < 1600: # Skip chunks shorter than 0.1s
                continue
                
            # Save chunk to temporary file for SenseVoice
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                temp_path = f.name
            sf.write(temp_path, chunk, 16000)
            
            text, emotion = sensevoice_model.transcribe(temp_path)
            os.remove(temp_path)
            
            if text.strip():
                segments.append({
                    "start": start,
                    "end": end,
                    "speaker": speaker,
                    "text": text,
                    "emotion": emotion
                })
                
        # 4. Map to Engineer/Driver
        print("4. Mapping to Engineer/Driver with Gemini API...")
        labeled_segments = self.llm_classify_speakers(segments)
        return labeled_segments
