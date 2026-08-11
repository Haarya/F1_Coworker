import os
import torch
import whisperx

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

        print("7. Classifying speakers with Gemini API...")
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
            print(f"LLM Classification failed: {e}")
            return segments

    def process_audio(self, audio_path, hf_token, device="cpu", compute_type="int8"):
        # 1. Transcribe with WhisperX
        print("1. Loading WhisperX model... (This downloads the large-v3 transcription model)")
        model = whisperx.load_model("large-v3", device, compute_type=compute_type) 
        print("2. Transcribing audio...")
        import librosa
        # Bypass whisperx.load_audio to avoid ffmpeg system dependency
        audio, _ = librosa.load(audio_path, sr=16000, mono=True)
        # Use initial_prompt to bias the model towards F1 terminology
        prompt_text = "F1 team radio, driver and race engineer talking about car telemetry, tires, drinks, box, strat."
        result = model.transcribe(
            audio, 
            batch_size=16, 
            language="en"
        )
        
        # 2. Align timestamps
        print("3. Aligning word timestamps...")
        model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
        
        # 3. Diarize
        from whisperx.diarize import DiarizationPipeline, assign_word_speakers
        print("4. Loading Pyannote Diarization model... (This downloads the speaker model using your HF Token)")
        diarize_model = DiarizationPipeline(model_name="pyannote/speaker-diarization-3.1", token=hf_token, device=device)
        print("5. Diarizing audio (Finding who spoke when)...")
        # WhisperX handles the ffmpeg bypass internally when passed a numpy array!
        diarize_segments = diarize_model(audio, min_speakers=2, max_speakers=2)
        
        # 4. Assign Speakers to Transcript
        print("6. Merging timestamps...")
        final_segments = assign_word_speakers(diarize_segments, result)
        
        # 5. Map to Engineer/Driver
        labeled_segments = self.llm_classify_speakers(final_segments["segments"])
        return labeled_segments
