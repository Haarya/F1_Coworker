import pytest
from unittest.mock import patch, MagicMock

def test_placeholder():
    from pipelines.audio_diarization import DiarizationPipeline
    pipeline = DiarizationPipeline()
    assert pipeline is not None

@patch("google.genai.Client")
@patch.dict("os.environ", {"GEMINI_API_KEY": "fake_key"})
def test_identify_speakers(mock_client_class):
    from pipelines.audio_diarization import DiarizationPipeline
    pipeline = DiarizationPipeline()
    
    segments = [
        {"speaker": "SPEAKER_00", "text": " box box, box box"},
        {"speaker": "SPEAKER_01", "text": " tires are completely gone mate"}
    ]
    
    # Mock Gemini response
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client
    mock_response = MagicMock()
    mock_response.text = '{"SPEAKER_00": "Engineer", "SPEAKER_01": "Driver"}'
    mock_client.models.generate_content.return_value = mock_response
    
    labeled_segments = pipeline.llm_classify_speakers(segments)
    
    assert labeled_segments[0]["speaker_label"] == "Engineer"
    assert labeled_segments[1]["speaker_label"] == "Driver"


@patch("whisperx.diarize.assign_word_speakers")
@patch("whisperx.diarize.DiarizationPipeline")
@patch("pipelines.audio_diarization.whisperx")
@patch("librosa.load")
@patch("pipelines.audio_diarization.DiarizationPipeline.llm_classify_speakers")
def test_process_audio(mock_llm_classify, mock_librosa_load, mock_whisperx, mock_whisperx_diarize, mock_assign):
    from pipelines.audio_diarization import DiarizationPipeline
    
    # Mock librosa
    import numpy as np
    mock_librosa_load.return_value = (np.zeros(100), 16000)

    # Mocking WhisperX behavior
    mock_model = MagicMock()
    mock_whisperx.load_model.return_value = mock_model
    mock_model.transcribe.return_value = {"segments": [{"start": 0, "end": 1, "text": " box"}], "language": "en"}
    
    mock_align_model = MagicMock()
    mock_whisperx.load_align_model.return_value = (mock_align_model, MagicMock())
    mock_whisperx.align.return_value = {"segments": [{"start": 0, "end": 1, "text": " box"}]}
    
    # Mock whisperx.diarize.DiarizationPipeline (Pyannote)
    mock_pyannote = MagicMock()
    mock_whisperx_diarize.return_value = mock_pyannote
    mock_pyannote.return_value = MagicMock()
    mock_assign.return_value = {"segments": [{"start": 0, "end": 1, "text": " box", "speaker": "SPEAKER_00"}]}
    
    # Mock LLM classification
    mock_llm_classify.return_value = [{"start": 0, "end": 1, "text": " box", "speaker": "SPEAKER_00", "speaker_label": "Engineer"}]
    
    pipeline = DiarizationPipeline()
    result = pipeline.process_audio("dummy.wav", "dummy_token")
    
    assert len(result) == 1
    assert result[0]["speaker_label"] == "Engineer"
