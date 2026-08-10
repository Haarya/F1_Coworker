import os
try:
    import whisperx
except ImportError:
    whisperx = None

class DiarizationPipeline:
    def __init__(self):
        self.engineer_keywords = ["box", "mode", "strat", "copy", "delta", "pit"]

    def identify_speakers(self, segments):
        # Count keyword hits per speaker
        speaker_hits = {}
        for seg in segments:
            speaker = seg.get("speaker")
            if not speaker:
                continue
            if speaker not in speaker_hits:
                speaker_hits[speaker] = 0
            
            text = seg.get("text", "").lower()
            if any(keyword in text for keyword in self.engineer_keywords):
                speaker_hits[speaker] += 1
                
        # Identify who is the engineer
        engineer_speaker_id = None
        if speaker_hits:
            engineer_speaker_id = max(speaker_hits, key=speaker_hits.get)
            
        # Apply labels
        result = []
        for seg in segments:
            new_seg = dict(seg) # copy
            if "speaker" in new_seg:
                if new_seg["speaker"] == engineer_speaker_id:
                    new_seg["speaker_label"] = "Engineer"
                else:
                    new_seg["speaker_label"] = "Driver"
            else:
                new_seg["speaker_label"] = "Unknown"
            result.append(new_seg)
            
        return result

    def process_audio(self, audio_path, hf_token, device="cpu", compute_type="int8"):
        if whisperx is None:
            raise ImportError("whisperx is not installed.")
            
        # 1. Transcribe
        model = whisperx.load_model("large-v2", device, compute_type=compute_type)
        audio = whisperx.load_audio(audio_path)
        result = model.transcribe(audio, batch_size=16)
        
        # 2. Align whisper output
        model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
        
        # 3. Diarize
        diarize_model = whisperx.DiarizationPipeline(use_auth_token=hf_token, device=device)
        diarize_segments = diarize_model(audio)
        
        # 4. Assign speakers
        result = whisperx.assign_word_speakers(diarize_segments, result)
        
        # 5. Map to Engineer/Driver
        labeled_segments = self.identify_speakers(result["segments"])
        
        return labeled_segments
