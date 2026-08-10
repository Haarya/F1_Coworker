def test_placeholder():
    from pipelines.audio_diarization import DiarizationPipeline
    pipeline = DiarizationPipeline()
    assert pipeline is not None

def test_identify_speakers():
    from pipelines.audio_diarization import DiarizationPipeline
    pipeline = DiarizationPipeline()
    
    # Mock output from WhisperX
    segments = [
        {"speaker": "SPEAKER_00", "text": " box box, box box"},
        {"speaker": "SPEAKER_01", "text": " tires are completely gone mate"}
    ]
    
    labeled_segments = pipeline.identify_speakers(segments)
    
    assert labeled_segments[0]["speaker_label"] == "Engineer"
    assert labeled_segments[1]["speaker_label"] == "Driver"

from unittest.mock import patch, MagicMock

@patch("pipelines.audio_diarization.whisperx")
def test_process_audio(mock_whisperx):
    from pipelines.audio_diarization import DiarizationPipeline
    
    # Mocking WhisperX behavior
    mock_model = MagicMock()
    mock_whisperx.load_model.return_value = mock_model
    mock_model.transcribe.return_value = {"segments": [{"start": 0, "end": 1, "text": " box"}], "language": "en"}
    
    mock_align_model = MagicMock()
    mock_whisperx.load_align_model.return_value = (mock_align_model, MagicMock())
    mock_whisperx.align.return_value = {"segments": [{"start": 0, "end": 1, "text": " box"}]}
    
    mock_diarize_model = MagicMock()
    mock_whisperx.DiarizationPipeline.return_value = mock_diarize_model
    mock_diarize_model.return_value = MagicMock()
    mock_whisperx.assign_word_speakers.return_value = {"segments": [{"start": 0, "end": 1, "text": " box", "speaker": "SPEAKER_00"}]}
    
    pipeline = DiarizationPipeline()
    result = pipeline.process_audio("dummy.wav", "dummy_token")
    
    assert len(result) == 1
    assert result[0]["speaker_label"] == "Engineer"
