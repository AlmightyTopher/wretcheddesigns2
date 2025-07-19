import os
import re
from pathlib import Path

# Extensions to consider as images
IMAGE_EXTENSIONS = (
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.tiff', '.ico'
)

# Regex patterns for visible image usage
IMG_TAG_REGEX = re.compile(r'<img[^>]+src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))["\']', re.IGNORECASE)
CSS_BG_REGEX = re.compile(r'background(?:-image)?:[^;]*url\(["\']?([^"\')]+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))["\']?\)', re.IGNORECASE)
MD_IMG_REGEX = re.compile(r'!\[[^\]]*\]\(([^\)]+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))\)', re.IGNORECASE)
SRC_REGEX = re.compile(r'src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))["\']', re.IGNORECASE)
# For JSX/TSX: <img src="..." /> or import ... from '...'
JSX_IMG_REGEX = re.compile(r'<img[^>]+src={["\']([^"\']+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))["\']}', re.IGNORECASE)
IMPORT_IMG_REGEX = re.compile(r'import\s+\w+\s+from\s+["\']([^"\']+\.(?:jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico))["\']', re.IGNORECASE)

PROJECT_ROOT = Path('.')
output_file = 'visible_image_urls.txt'
found = set()

for root, _, files in os.walk(PROJECT_ROOT):
    for file in files:
        ext = Path(file).suffix.lower()
        if ext in {'.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.css', '.md', '.json'}:
            file_path = Path(root) / file
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    found.update(IMG_TAG_REGEX.findall(text))
                    found.update(CSS_BG_REGEX.findall(text))
                    found.update(MD_IMG_REGEX.findall(text))
                    found.update(SRC_REGEX.findall(text))
                    found.update(JSX_IMG_REGEX.findall(text))
                    found.update(IMPORT_IMG_REGEX.findall(text))
            except Exception:
                continue
        # Also include direct references to image files in public/static folders
        elif ext in IMAGE_EXTENSIONS:
            rel_path = str((Path(root) / file).as_posix())
            found.add(rel_path)

# Filter out duplicates and write to file
with open(output_file, 'w', encoding='utf-8') as out:
    for url in sorted(found):
        out.write(url + '\n')

print(f"Exported {len(found)} image URLs/paths to {output_file}") 