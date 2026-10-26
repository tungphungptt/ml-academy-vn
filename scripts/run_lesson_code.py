"""Run every standalone Python fence; compare declared stdout, list contextual snippets.
Output report includes source hashes and real stdout. Never treats omitted fences as run.
"""
import hashlib
import importlib.metadata
import json
import os
import pathlib
import platform
import re
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
os.chdir(root)
results = []
with tempfile.TemporaryDirectory(prefix='ml-lessons-') as tmp:
    env = {**os.environ, 'OMP_NUM_THREADS': '1', 'OPENBLAS_NUM_THREADS': '1', 'MPLBACKEND': 'Agg', 'XDG_CACHE_HOME': tmp,
           'MPLCONFIGDIR': str(pathlib.Path(tmp) / 'matplotlib'), 'ML_ACADEMY_OUTPUT_DIR': tmp}
    for file in sorted(pathlib.Path('content/lessons').glob('*.md')):
        text = file.read_text()
        for number, match in enumerate(re.finditer(r'^```python([^\n]*)\n(.*?)^```', text, re.M | re.S), 1):
            info, code = match.group(1).strip(), match.group(2)
            row = {'file': str(file), 'block': number, 'sha256': hashlib.sha256(code.encode()).hexdigest()}
            if info:
                assert info == 'snippet', f'Unknown fence kind: {file} {info}'
                compile(code, str(file), 'exec')
                row.update(status='context-only', reason='Requires external model/weights; syntax compiled, not executed')
                results.append(row)
                print(f'SNIPPET {file}#{number}', flush=True)
                continue
            # One process per block avoids state leaking across examples; run at repo root for lab references.
            run = subprocess.run([sys.executable, '-c', code], env=env, capture_output=True, text=True, timeout=180)
            expected = re.match(r'\s*Kết quả kỳ vọng[^`\n]*`([^`]+)`', text[match.end():])
            row.update(status='pass' if run.returncode == 0 else 'fail', stdout=run.stdout.strip(), stderr=run.stderr.strip())
            if expected:
                row['expected'] = expected.group(1).strip()
                if run.stdout.strip() != row['expected']: row['status'] = 'fail'
            results.append(row)
            print(f"{row['status'].upper()} {file}#{number}: {run.stdout.strip()}", flush=True)
            if row['status'] == 'fail': print(run.stderr, flush=True)
report = {'versions': {'python': platform.python_version(), **{x: importlib.metadata.version(x) for x in ['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'torch']}}, 'blocks': results}
pathlib.Path('docs/curriculum-execution.json').write_text(json.dumps(report, ensure_ascii=False, indent=1)+'\n')
bad = sum(r['status'] == 'fail' for r in results)
print(f"Executed {sum(r['status'] != 'context-only' for r in results)}; context-only {sum(r['status'] == 'context-only' for r in results)}; failures {bad}")
sys.exit(bool(bad))
