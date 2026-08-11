import urllib.request
import zipfile
import os
import shutil

def main():
    print("Downloading FFmpeg...")
    url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    zip_path = "ffmpeg.zip"
    urllib.request.urlretrieve(url, zip_path)
    
    print("Extracting FFmpeg...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(".")
        
    ffmpeg_exe = "ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe"
    ffprobe_exe = "ffmpeg-master-latest-win64-gpl/bin/ffprobe.exe"
    
    scripts_dir = os.path.join("venv311", "Scripts")
    
    if os.path.exists(ffmpeg_exe):
        shutil.move(ffmpeg_exe, os.path.join(scripts_dir, "ffmpeg.exe"))
    if os.path.exists(ffprobe_exe):
        shutil.move(ffprobe_exe, os.path.join(scripts_dir, "ffprobe.exe"))
        
    print("Cleaning up...")
    os.remove(zip_path)
    shutil.rmtree("ffmpeg-master-latest-win64-gpl")
    
    print("FFmpeg installed successfully in the virtual environment!")

if __name__ == "__main__":
    main()
