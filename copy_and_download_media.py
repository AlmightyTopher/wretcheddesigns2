import os
import shutil
from pathlib import Path
import re
import requests

# Media extensions
MEDIA_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.webm', '.mov',
    '.mp3', '.wav', '.pdf', '.tiff', '.bmp'
}

PROJECT_ROOT = Path('.').resolve()
DEST_ROOT = Path(r'C:/Users/Dogma/Media Backup')
DEST_ROOT.mkdir(parents=True, exist_ok=True)

skipped_log = DEST_ROOT / 'skipped_files.log'
external_log = DEST_ROOT / 'external_media_links.txt'
summary_log = DEST_ROOT / 'summary.log'

local_copied = 0
external_downloaded = 0
external_failed = 0

# Helper: find URLs in text
URL_REGEX = re.compile(r'https?://[^\s"\'>]+\.(?:jpg|jpeg|png|gif|svg|mp4|webm|mov|mp3|wav|pdf|tiff|bmp)', re.IGNORECASE)

# 1. Find all local media files
local_media_files = []
for root, _, files in os.walk(PROJECT_ROOT):
    for file in files:
        ext = Path(file).suffix.lower()
        if ext in MEDIA_EXTENSIONS:
            abs_path = Path(root) / file
            rel_path = abs_path.relative_to(PROJECT_ROOT)
            local_media_files.append((abs_path, rel_path))

# 2. Copy local media files
with open(skipped_log, 'w', encoding='utf-8') as skiplog:
    for abs_path, rel_path in local_media_files:
        dest_path = DEST_ROOT / rel_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        if dest_path.exists():
            skiplog.write(f"Skipped (already exists): {rel_path}\n")
        else:
            try:
                shutil.copy2(abs_path, dest_path)
                local_copied += 1
            except Exception as e:
                skiplog.write(f"Failed to copy {rel_path}: {e}\n")

# 3. Find and download external media files
external_urls = set()
for root, _, files in os.walk(PROJECT_ROOT):
    for file in files:
        if Path(file).suffix.lower() in {'.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.md', '.json', '.txt'}:
            try:
                with open(Path(root) / file, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    for match in URL_REGEX.findall(text):
                        external_urls.add(match)
            except Exception:
                continue

with open(external_log, 'w', encoding='utf-8') as extlog:
    for url in sorted(external_urls):
        filename = url.split('/')[-1].split('?')[0]
        dest_path = DEST_ROOT / filename
        if dest_path.exists():
            extlog.write(f"{url} | {filename} | Skipped (already exists)\n")
            continue
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                with open(dest_path, 'wb') as out:
                    out.write(r.content)
                extlog.write(f"{url} | {filename}\n")
                external_downloaded += 1
            else:
                extlog.write(f"{url} | Download failed (status {r.status_code})\n")
                external_failed += 1
        except Exception:
            extlog.write(f"{url} | Download failed\n")
            external_failed += 1

# 5. Write summary log
with open(summary_log, 'w', encoding='utf-8') as s:
    s.write(f"Local files copied: {local_copied}\n")
    s.write(f"External files downloaded: {external_downloaded}\n")
    s.write(f"External files failed: {external_failed}\n") 