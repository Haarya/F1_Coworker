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


@patch("pipelines.audio_diarization.Pipeline.from_pretrained")
@patch("pipelines.audio_diarization.librosa.load")
@patch("pipelines.audio_diarization.sensevoice_model.transcribe")
@patch("pipelines.audio_diarization.DiarizationPipeline.llm_classify_speakers")
def test_process_audio(mock_llm_classify, mock_transcribe, mock_librosa_load, mock_pipeline):
    from pipelines.audio_diarization import DiarizationPipeline
    
    # Mock librosa
    import numpy as np
    mock_librosa_load.return_value = (np.zeros(16000), 16000)

    # Mock Pyannote Pipeline
    mock_diarize_pipeline = MagicMock()
    mock_pipeline.return_value = mock_diarize_pipeline
    
    # Mock pyannote speaker diarization output
    mock_turn = MagicMock()
    mock_turn.start = 0.0
    mock_turn.end = 1.0
    mock_diarize_pipeline.return_value.itertracks.return_value = [(mock_turn, None, "SPEAKER_00")]
    
    # Mock SenseVoice
    mock_transcribe.return_value = ("box box", "neutral")
    
    # Mock LLM classification
    mock_llm_classify.return_value = [{"start": 0.0, "end": 1.0, "text": "box box", "speaker": "SPEAKER_00", "speaker_label": "Engineer", "emotion": "neutral"}]
    
    pipeline = DiarizationPipeline()
    result = pipeline.process_audio("dummy.wav", "dummy_token")
    
    assert len(result) == 1
    assert result[0]["speaker_label"] == "Engineer"
