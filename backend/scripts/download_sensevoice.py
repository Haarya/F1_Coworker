import urllib.request
import tarfile
import os
from pathlib import Path
import sys

def download_sensevoice():
    url = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2"
    
    # Resolve the backend directory robustly
    backend_dir = Path(__file__).parent.parent.absolute()
    models_dir = backend_dir / "models"
    models_dir.mkdir(exist_ok=True, parents=True)
    
    tar_path = models_dir / "sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2"
    target_dir = models_dir / "sensevoice"
    
    if target_dir.exists() and (target_dir / "model.int8.onnx").exists():
        print("Model already exists at", target_dir)
        return
        
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, tar_path)
    except Exception as e:
        print(f"Download failed: {e}")
        sys.exit(1)
        
    print("Extracting...")
    try:
        with tarfile.open(tar_path, "r:bz2") as tar:
            tar.extractall(path=models_dir)
    except Exception as e:
        print(f"Extraction failed: {e}")
        sys.exit(1)
        
    # Rename extracted directory to 'sensevoice'
    extracted_dir = models_dir / "sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17"
    if extracted_dir.exists():
        if target_dir.exists():
            import shutil
            shutil.rmtree(target_dir)
        extracted_dir.rename(target_dir)
        
    if tar_path.exists():
        os.remove(tar_path)
        
    print(f"SenseVoice downloaded and extracted to {target_dir}")

if __name__ == "__main__":
    download_sensevoice()
