"""Full-glyph official OFL fonts; never subset Vietnamese combining marks.
Build candidates privately. Copy only the selected display family to public/fonts.
"""
from pathlib import Path
import hashlib, json, urllib.request, urllib.parse, unicodedata
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.local/refine-fonts';OUT.mkdir(parents=True,exist_ok=True)
samples='Trí tuệ nhân tạo. Học có giám sát. Lan truyền ngược. Ngưỡng quyết định. Bắt đầu từ điều bạn tò mò. Đường cong mất mát. ĂÂĐÊÔƠƯ ăâđêôơư 0123456789,.;:!?()—→'
required=set(range(0x20,0x7f))|set(range(0x1ea0,0x1efa))|{ord(c) for c in unicodedata.normalize('NFD',samples)}
required.discard(0x2192) # decorative arrows may fall back; Vietnamese words must not
report=[]
for family,files in [('lora',['Lora[wght].ttf','Lora-Italic[wght].ttf']),('newsreader',['Newsreader[opsz,wght].ttf','Newsreader-Italic[opsz,wght].ttf']),('bevietnampro',['BeVietnamPro-Italic.ttf','BeVietnamPro-SemiBoldItalic.ttf','BeVietnamPro-BoldItalic.ttf'])]:
    base=f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/'
    for filename in [*files,'OFL.txt']:
        target=OUT/f'{family}-{filename}'
        url=base+urllib.parse.quote(filename)
        if not target.exists():
            with urllib.request.urlopen(url,timeout=45) as r: target.write_bytes(r.read())
        if filename=='OFL.txt':continue
        font=TTFont(target);missing=sorted(required-set(font.getBestCmap()))
        # Some families omit the arrow; instructional icons use SVG instead.
        if missing:raise RuntimeError(f'{filename} missing glyphs: {missing}')
        assert 'GPOS' in font and 'GSUB' in font
        font.flavor='woff2';dest=target.with_suffix('.woff2');font.save(dest)
        report.append({'family':family,'file':dest.name,'source':url,'sourceSHA256':hashlib.sha256(target.read_bytes()).hexdigest(),'woffSHA256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'requiredGlyphs':len(required),'missing':missing,'axes':[{ 'tag':a.axisTag,'min':a.minValue,'max':a.maxValue}for a in font['fvar'].axes] if 'fvar' in font else []})
(ROOT/'docs/neuralclone-refinement-font-build.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report))
