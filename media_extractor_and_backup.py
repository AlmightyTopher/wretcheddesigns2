import os
import re
import shutil
from pathlib import Path
import requests

# Configuration
MEDIA_EXTENSIONS = (
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.webm', '.mov',
    '.mp3', '.wav', '.pdf', '.tiff', '.bmp'
)
PROJECT_ROOT = Path('.').resolve()
DEST_ROOT = Path(r'C:/Users/Dogma/Media Backup')
DEST_ROOT.mkdir(parents=True, exist_ok=True)

# Logs
external_log = DEST_ROOT / 'external_media_links.txt'
skipped_log = DEST_ROOT / 'skipped_files.log'
summary_log = DEST_ROOT / 'summary.log'

# Regex for media references (URLs and local paths)
MEDIA_REF_REGEX = re.compile(
    r'(["\'])([^"\']+?\.(?:jpg|jpeg|png|gif|svg|mp4|webm|mov|mp3|wav|pdf|tiff|bmp))(\1)',
    re.IGNORECASE
)
URL_REGEX = re.compile(r'https?://[^\s"\'>]+\.(?:jpg|jpeg|png|gif|svg|mp4|webm|mov|mp3|wav|pdf|tiff|bmp)', re.IGNORECASE)

# 1. Scan all files for media references
def scan_for_media_references():
    print("Scanning for media references in project files...")
    local_refs = set()
    external_refs = set()
    for root, _, files in os.walk(PROJECT_ROOT):
        for file in files:
            file_path = Path(root) / file
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    # Find all media references
                    for match in MEDIA_REF_REGEX.findall(text):
                        ref = match[1]
                        if ref.startswith('http://') or ref.startswith('https://'):
                            external_refs.add(ref)
                        else:
                            # Normalize and resolve local path
                            local_path = (file_path.parent / ref).resolve()
                            if PROJECT_ROOT in local_path.parents or local_path == PROJECT_ROOT:
                                local_refs.add(local_path)
                    # Also find any raw URLs
                    for url in URL_REGEX.findall(text):
                        external_refs.add(url)
            except Exception:
                continue
    print(f"Found {len(local_refs)} local media references and {len(external_refs)} external media references.")
    return local_refs, external_refs

def copy_local_files(local_refs, skipped):
    copied = 0
    for local_path in local_refs:
        if not local_path.exists():
            print(f"Local file not found (skipped): {local_path}")
            continue
        dest_path = DEST_ROOT / local_path.name
        if dest_path.exists():
            print(f"Skipped (already exists): {dest_path}")
            skipped.append(str(dest_path))
            continue
        try:
            print(f"Copying local file: {local_path} -> {dest_path}")
            shutil.copy2(local_path, dest_path)
            copied += 1
        except Exception as e:
            print(f"Failed to copy {local_path}: {e}")
            skipped.append(str(dest_path))
    return copied

def download_external_files(external_refs, extlog, skipped):
    downloaded = 0
    failed = 0
    for url in sorted(external_refs):
        filename = url.split('/')[-1].split('?')[0]
        dest_path = DEST_ROOT / filename
        if dest_path.exists():
            print(f"Skipped (already exists): {dest_path}")
            extlog.write(f"{url} | {filename} | Skipped (already exists)\n")
            skipped.append(str(dest_path))
            continue
        try:
            print(f"Downloading external file: {url}")
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                with open(dest_path, 'wb') as out:
                    out.write(r.content)
                print(f"Downloaded: {filename}")
                extlog.write(f"{url} | {filename}\n")
                downloaded += 1
            else:
                print(f"Download failed (status {r.status_code}): {url}")
                extlog.write(f"{url} | Download failed (status {r.status_code})\n")
                failed += 1
        except Exception as e:
            print(f"Download failed: {url} ({e})")
            extlog.write(f"{url} | Download failed\n")
            failed += 1
    return downloaded, failed

def verify_all_present(local_refs, external_refs):
    print("Verifying all referenced media are present in the backup folder...")
    missing = []
    for local_path in local_refs:
        dest_path = DEST_ROOT / local_path.name
        if not dest_path.exists():
            print(f"Missing local file in backup: {local_path}")
            missing.append(str(local_path))
    for url in external_refs:
        filename = url.split('/')[-1].split('?')[0]
        dest_path = DEST_ROOT / filename
        if not dest_path.exists():
            print(f"Missing external file in backup: {url}")
            missing.append(url)
    return missing

def main():
    # 1 & 2. Scan and classify
    local_refs, external_refs = scan_for_media_references()
    skipped = []
    # 3. Copy local
    print("\nCopying local media files...")
    local_copied = copy_local_files(local_refs, skipped)
    # 4. Download external
    print("\nDownloading external media files...")
    with open(external_log, 'w', encoding='utf-8') as extlog:
        external_downloaded, external_failed = download_external_files(external_refs, extlog, skipped)
    # 7. Reassess for missing
    print("\nReassessing for missing media files...")
    missing = verify_all_present(local_refs, external_refs)
    if missing:
        print(f"Found {len(missing)} missing media references. Retrying...")
        # Try again for missing
        missing_local = [Path(m) for m in missing if not m.startswith('http')]
        missing_external = [m for m in missing if m.startswith('http')]
        local_copied += copy_local_files(missing_local, skipped)
        with open(external_log, 'a', encoding='utf-8') as extlog:
            d, f = download_external_files(missing_external, extlog, skipped)
            external_downloaded += d
            external_failed += f
    else:
        print("All referenced media are present in the backup folder.")
    # 8. Write summary
    print("\nWriting summary log...")
    with open(skipped_log, 'w', encoding='utf-8') as skiplog:
        for s in skipped:
            skiplog.write(f"{s}\n")
    with open(summary_log, 'w', encoding='utf-8') as s:
        s.write(f"Local files copied: {local_copied}\n")
        s.write(f"External files downloaded: {external_downloaded}\n")
        s.write(f"Failures: {external_failed}\n")
        s.write(f"Skipped duplicates: {len(skipped)}\n")
        for sfile in skipped:
            s.write(f"{sfile}\n")
    print("\nDone! See summary.log for details.")

if __name__ == '__main__':
    main()