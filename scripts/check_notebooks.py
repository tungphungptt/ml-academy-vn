"""Validate and execute notebooks in fresh real IPython kernels; never rewrite outputs.
Install requirements-curriculum-test.txt plus the documented CPU torch wheel.
Run from any directory; each notebook starts at repository root with isolated artifacts.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import sys
import tempfile

import nbformat
from nbclient import NotebookClient
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('notebooks', nargs='*')
parser.add_argument('--report', type=Path)
args = parser.parse_args()
files = [Path(p).resolve() for p in args.notebooks] if args.notebooks else sorted((ROOT/'public/notebooks').rglob('*.ipynb'))
if not files:
    parser.error('No notebooks selected')
if not args.notebooks:
    labs = json.loads((ROOT/'content/labs.json').read_text())
    projects = json.loads((ROOT/'content/projects.json').read_text())
    urls = {url for lab in labs for url in lab['notebooks'].values()}
    urls.update(project['notebookUrl'] for project in projects if project.get('notebookUrl'))
    expected_files = {(ROOT/'public'/url.lstrip('/')).resolve() for url in urls}
    if {p.resolve() for p in files} != expected_files:
        parser.error('Notebook files differ from the lab/project registries')
results = []
for file in files:
    record = {'file': str(file.relative_to(ROOT)), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()}
    manager = None
    client = None
    try:
        nb = nbformat.read(file, as_version=4)
        nbformat.validate(nb)
        expected = [''.join(o.get('text', '') for o in c.outputs if o.output_type == 'stream' and o.name == 'stdout')
                    for c in nb.cells if c.cell_type == 'code']
        counts = [c.execution_count for c in nb.cells if c.cell_type == 'code']
        assert counts == list(range(1, len(expected)+1)), f'Nonsequential recorded execution counts: {counts}'
        with tempfile.TemporaryDirectory(prefix='ml-notebook-check-') as tmp:
            kernel_dir = Path(tmp)/'kernels'/'curriculum-check'
            kernel_dir.mkdir(parents=True)
            (kernel_dir/'kernel.json').write_text(json.dumps({'argv': [sys.executable, '-m', 'ipykernel_launcher', '-f', '{connection_file}'], 'display_name': 'Curriculum isolated CPU', 'language': 'python'}))
            manager = KernelManager(kernel_name='curriculum-check', kernel_spec_manager=KernelSpecManager(kernel_dirs=[str(kernel_dir.parent)]))
            env = {**os.environ, 'OMP_NUM_THREADS': '1', 'OPENBLAS_NUM_THREADS': '1', 'MPLBACKEND': 'Agg',
                   'ML_ACADEMY_OUTPUT_DIR': tmp, 'MPLCONFIGDIR': tmp+'/mpl', 'XDG_CACHE_HOME': tmp,
                   'IPYTHONDIR': tmp+'/ipython', 'JUPYTER_CONFIG_DIR': tmp+'/jupyter-config'}
            client = NotebookClient(nb, km=manager, timeout=180, resources={'metadata': {'path': str(ROOT)}})
            try:
                client.execute(env=env)
                actual = [''.join(o.get('text', '') for o in c.outputs if o.output_type == 'stream' and o.name == 'stdout')
                          for c in nb.cells if c.cell_type == 'code']
                assert actual == expected, f'Output mismatch: actual={actual!r}, recorded={expected!r}'
                record.update(passed=True, cells=len(actual), stdout=actual)
            finally:
                if client.kc is not None:
                    client.kc.stop_channels()
                if manager.has_kernel:
                    manager.shutdown_kernel(now=True)
    except Exception as error:
        record.update(passed=False, error=f'{type(error).__name__}: {error}')
    results.append(record)
    print(('PASS' if record['passed'] else 'FAIL'), record['file'], flush=True)
    if not record['passed']:
        print(record['error'][-1600:], flush=True)
report = {'runtime': {name: importlib.metadata.version(name) for name in ['nbformat', 'nbclient', 'ipykernel']},
          'method': 'Fresh real IPython kernel per notebook; schema, sequential cells and original recorded stdout checked without regeneration', 'notebooks': results}
if args.report:
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=1)+'\n')
print(f"{len(results)} notebooks, {sum(not r['passed'] for r in results)} failures")
sys.exit(any(not r['passed'] for r in results))
