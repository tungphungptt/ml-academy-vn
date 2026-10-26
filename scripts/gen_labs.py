"""Execute registry variants on CPU before updating expected stdout and runnable notebooks.
Run at repository root with the pinned environment in requirements-curriculum.txt.
Any failed variant aborts generation; it is never recorded as a successful/null run.
"""
import hashlib
import importlib.metadata
import json
import os
import pathlib
import platform
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
os.chdir(ROOT)
registry = ROOT / 'content/labs.json'
labs = json.loads(registry.read_text())
versions = {'python': platform.python_version(), **{name: importlib.metadata.version(name) for name in ['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'torch']}}
pending = []
with tempfile.TemporaryDirectory(prefix='ml-labs-') as tmp:
    env = {**os.environ, 'OMP_NUM_THREADS': '1', 'OPENBLAS_NUM_THREADS': '1', 'MPLBACKEND': 'Agg',
           'XDG_CACHE_HOME': tmp, 'MPLCONFIGDIR': str(pathlib.Path(tmp) / 'matplotlib'), 'ML_ACADEMY_OUTPUT_DIR': tmp}
    for lab in labs:
        for variant in lab['variants']:
            source = ROOT / 'labs' / lab['id'] / f'{variant}.py'
            code = source.read_text()
            run = subprocess.run([sys.executable, str(source)], cwd=ROOT, env=env, text=True, capture_output=True, timeout=180)
            if run.returncode:
                raise RuntimeError(f"{source}: {run.stdout}\n{run.stderr}")
            stdout = run.stdout
            lab.setdefault('expected', {})[variant] = stdout.strip()
            lab.setdefault('notebooks', {})[variant] = f"/notebooks/{lab['id']}_{variant}.ipynb"
            lab.setdefault('verification', {})[variant] = {'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'versions': versions}
            nb = {'nbformat': 4, 'nbformat_minor': 4,
                  'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}, 'language_info': {'name': 'python', 'version': platform.python_version()}},
                  'cells': [{'cell_type': 'markdown', 'metadata': {}, 'source': [f"# {lab['title']} ({variant})\n", lab['description']+'\n', '\nChạy từ thư mục gốc repository với môi trường trong `requirements-curriculum.txt`. Với PyTorch, cài CPU wheel từ index chính thức như hướng dẫn trong docs/curriculum-practice.md. Output bên dưới được ghi từ lần chạy CPU thực tế; không phải benchmark phần cứng.\n']},
                            {'cell_type': 'code', 'metadata': {}, 'source': code.splitlines(True), 'execution_count': 1,
                             'outputs': [{'output_type': 'stream', 'name': 'stdout', 'text': stdout.splitlines(True)}]}]}
            pending.append((ROOT / 'public' / lab['notebooks'][variant].lstrip('/'), nb))
            print(f"OK {lab['id']}/{variant}: {stdout.strip()}", flush=True)
# No output files change until every variant has executed successfully.
for file, nb in pending:
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(nb, ensure_ascii=False, indent=1)+'\n')
registry.write_text(json.dumps(labs, ensure_ascii=False, indent=1)+'\n')
print(f'{len(labs)} labs / {len(pending)} executed variants')
