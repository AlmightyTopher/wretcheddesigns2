import os
import shutil
from pathlib import Path

# Define media file extensions
MEDIA_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp',  # Images
    '.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm',    # Videos
    '.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a',            # Audio
    '.pdf',                                                     # Documents
}

# Get home directory and set backup folder
home_dir = Path.home()
dest_dir = home_dir / 'media_backup'
dest_dir.mkdir(exist_ok=True)

# Log file for skipped files
log_file = dest_dir / 'skipped_files.log'

with open(log_file, 'a', encoding='utf-8') as log:
    for root, _, files in os.walk('.'):
        for file in files:
            ext = Path(file).suffix.lower()
            if ext in MEDIA_EXTENSIONS:
                src_path = Path(root) / file
                dest_path = dest_dir / file
                if dest_path.exists():
                    log.write(f"Skipped (already exists): {file}\n")
                else:
                    try:
                        shutil.copy2(src_path, dest_path)
                    except Exception as e:
                        log.write(f"Failed to copy {file}: {e}\n") 