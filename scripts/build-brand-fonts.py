"""Build full Vietnamese WOFF2 faces without splitting combining clusters.
Development only: python -m pip install 'fonttools[woff]' brotli
Downloads only official Google Fonts stylesheet/assets; retains the OFL license.
"""
from pathlib import Path
import json
import re
import unicodedata
import urllib.request
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
cache = ROOT / '.local/font-input'
cache.mkdir(parents=True, exist_ok=True)
url = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
css = urllib.request.urlopen(url, timeout=30).read().decode('utf-8')
faces = re.findall(r'font-weight:\s*(\d+);.*?url\((https://fonts.gstatic.com/[^)]+\.ttf)\)', css, re.S)
if {w for w, _ in faces} != {'400', '500', '600', '700'}:
    raise RuntimeError('Expected four full TTF faces from Google Fonts')
samples = ['Bắt đầu từ điều bạn tò mò.', 'Học máy. Hiểu từ gốc.', 'Đường cong mất mát và tối ưu hóa.', 'Tiền xử lý dữ liệu.', 'Mạng nơ-ron nhân tạo.', 'Hồi quy tuyến tính và phân loại.', 'Khám phá trí tuệ nhân tạo.', 'Những điều cần biết trước khi bắt đầu.']
# All six tones on every Vietnamese vowel, uppercase/lowercase, plus Đ/đ.
# Coverage checks must also protect letters absent from the eight UI phrases.
samples += ['Đđ'] + [v + tone for v in 'AaĂăÂâEeÊêIiOoÔôƠơUuƯưYy' for tone in ('', '\u0300', '\u0301', '\u0309', '\u0303', '\u0323')]
required = {ord(c) for s in samples for form in ('NFC', 'NFD') for c in unicodedata.normalize(form, s)}
blocks, report = [], []
for weight, source in faces:
    ttf = cache / f'be-vietnam-pro-{weight}.ttf'
    ttf.write_bytes(urllib.request.urlopen(source, timeout=30).read())
    font = TTFont(ttf)
    if 'GPOS' not in font or 'GSUB' not in font:
        raise RuntimeError(f'{weight}: required shaping tables are missing')
    missing = required - set(font.getBestCmap())
    if missing:
        raise RuntimeError(f'{weight}: missing glyphs {sorted(missing)}')
    name = f'be-vietnam-pro-full-{weight}-v2.woff2'
    font.flavor = 'woff2'
    target = ROOT / 'public/fonts' / name
    font.save(target)
    blocks.append(f'@font-face {{\n  font-family: "Be Vietnam Pro";\n  font-style: normal;\n  font-weight: {weight};\n  font-display: swap;\n  src: url("/fonts/{name}") format("woff2");\n}}')
    report.append({'weight': int(weight), 'source': source, 'file': name, 'bytes': target.stat().st_size, 'glyphs': len(font.getBestCmap()), 'missingNfcNfdSampleGlyphs': sorted(missing), 'gpos': 'GPOS' in font, 'gsub': 'GSUB' in font})
(ROOT / 'src/app/fonts.css').write_text('/* Full faces preserve Vietnamese combining clusters and shaping tables. */\n' + '\n'.join(blocks) + '\n', encoding='utf-8')
(ROOT / 'docs/neuralclone-font-coverage.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
