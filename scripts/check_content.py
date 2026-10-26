"""Structural validation, not a claim of academic completeness. Coverage is reviewed separately."""
import json
import pathlib
import re
import sys

bad=[]
cat=json.load(open('content/catalog.json'))
lessons=[l for c in cat['courses'] for m in c['modules'] for l in m['lessons']]
slugs=[l['s'] for l in lessons]
if len(set(slugs))!=len(slugs): bad.append('duplicate lesson slug')
if len(set(l['f'] for l in lessons))!=len(lessons): bad.append('duplicate content filename')
if len({c['slug'] for c in cat['courses']})!=len(cat['courses']): bad.append('duplicate course slug')
position={s:i for i,s in enumerate(slugs)}
for co in cat['courses']:
 keys=[m['key'] for m in co['modules']]
 if len(set(keys))!=len(keys): bad.append('duplicate module key: '+co['slug'])
for l in lessons:
 slug=l['s'];f=pathlib.Path('content/lessons')/l['f']
 if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug): bad.append('invalid slug '+slug)
 if l['f']!=slug+'.md' or not f.is_file(): bad.append('invalid/missing file '+slug);continue
 txt=f.read_text()
 if txt.count('$$')%2: bad.append('unbalanced math '+slug)
 if re.search(r'lorem ipsum|\bTODO\b',txt,re.I): bad.append('placeholder '+slug)
 for pattern in [r'\*\*Mục tiêu',r'## Bài tập',r'## Đáp án',r'## (Tóm tắt|Tổng kết)',r'## [^\n]*([Ll]ỗi|[Đđ]iều kiện|[Gg]iới hạn|Cold start|Checklist)',r'## Nguồn tham khảo']:
  if not re.search(pattern,txt):bad.append(f'missing {pattern}: {slug}')
 if not l.get('src') or not all(s['url'].startswith('https://') for s in l['src']):bad.append('invalid sources '+slug)
 if l.get('tier') not in ['Core','Intermediate','Advanced'] or l.get('kind') not in ['lesson','practice'] or not isinstance(l.get('minutes'),int) or l['minutes']<=0:bad.append('invalid metadata '+slug)
 if len(set(l['prerequisites']))!=len(l['prerequisites']):bad.append('duplicate prerequisite '+slug)
 for prereq in l['prerequisites']:
  if prereq not in position or position[prereq]>=position[slug]:bad.append(f'prerequisite order/cycle: {slug} -> {prereq}')
 for url in re.findall(r'\]\(([^)]+)\)',txt):
  if url.startswith('/learn/') and url.removeprefix('/learn/') not in position:bad.append('broken lesson link '+url)
  if url.startswith('/img/') and not pathlib.Path('public'+url).is_file():bad.append('missing image '+url)
  if url.startswith('/lab?lab=') and url.split('=',1)[1] not in {x['id'] for x in json.load(open('content/labs.json'))}:bad.append('missing lab '+url)
  if url.startswith(('labs/','content/','public/')) and not pathlib.Path(url).is_file():bad.append('missing local file '+url)
 q=pathlib.Path('content/quizzes')/(slug+'.json')
 if not q.exists():bad.append('missing quiz '+slug);continue
 questions=json.loads(q.read_text())
 if len(questions)<2:bad.append('too few quiz questions '+slug)
 for i,x in enumerate(questions):
  if len(x['options'])!=len(set(x['options'])) or len(x['options'])<2 or not 0<=x['correct']<len(x['options']) or not x['prompt'].strip() or not x['explanation'].strip():bad.append(f'invalid quiz {slug}#{i}')
before=json.load(open('docs/curriculum-inventory-before.json'))['lessons']
for l in before:
 if l['s'] not in position:bad.append('lost original slug '+l['s'])
files={p.name for p in pathlib.Path('content/lessons').glob('*.md')}
if files!={l['f'] for l in lessons}:bad.append('orphan/unregistered Markdown')
coverage=json.load(open('docs/curriculum-coverage.json'))
if len(coverage)!=46 or len({r['id'] for r in coverage})!=46:bad.append('coverage topic IDs/count')
for row in coverage:
 if not row.get('after_evidence') or not row.get('after_lessons') or any(s not in position for s in row['after_lessons']):bad.append('invalid coverage evidence '+row['id'])
print(f'{len(lessons)} lesson records structurally checked; {len(bad)} errors')
for error in bad:print(error)
sys.exit(bool(bad))
