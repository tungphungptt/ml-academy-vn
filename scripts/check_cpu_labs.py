"""Execute existing local CPU labs without rewriting registry/notebook outputs.
Use the pinned curriculum environment and official CPU torch wheel.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--report', type=Path, default=ROOT/'docs/neuralclone-polish-cpu.json')
args = parser.parse_args()
versions = {'python': platform.python_version(), 'platform': platform.platform()}
for name in ['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'scipy', 'torch']:
    versions[name] = importlib.metadata.version(name)
registry = ROOT/'content/labs.json'
registry_hash = hashlib.sha256(registry.read_bytes()).hexdigest()
labs = json.loads(registry.read_text(encoding='utf-8'))
results = []
with tempfile.TemporaryDirectory(prefix='polish-cpu-artifacts-', dir=ROOT/'.local') as tmp:
    env = {**os.environ, 'PYTHONUTF8':'1', 'OMP_NUM_THREADS':'1', 'OPENBLAS_NUM_THREADS':'1',
           'MPLBACKEND':'Agg', 'XDG_CACHE_HOME':tmp, 'MPLCONFIGDIR':str(Path(tmp)/'mpl'), 'ML_ACADEMY_OUTPUT_DIR':tmp}
    for lab in labs:
        if lab['runtime'] != 'local':
            continue
        for variant in lab['variants']:
            source = ROOT/'labs'/lab['id']/f'{variant}.py'
            try:
                run = subprocess.run([sys.executable,'-X','utf8',str(source)],cwd=ROOT,env=env,
                                     text=True,encoding='utf-8',capture_output=True,timeout=180)
                expected = lab['expected'][variant]
                record = {'lab':lab['id'],'variant':variant,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
                          'returncode':run.returncode,'executed':run.returncode==0,'matchesRecorded':run.stdout.strip()==expected,
                          'stdout':run.stdout.strip(),'expected':expected,'stderr':run.stderr.strip()}
            except subprocess.TimeoutExpired:
                record = {'lab':lab['id'],'variant':variant,'executed':False,'matchesRecorded':False,'error':'180 second timeout'}
            results.append(record)
            print(('MATCH' if record['executed'] and record['matchesRecorded'] else 'REVIEW'), lab['id'],flush=True)
unchanged = registry_hash == hashlib.sha256(registry.read_bytes()).hexdigest()
report = {'checkedAt':datetime.now(timezone.utc).isoformat(),'versions':versions,'threads':1,'registryUnchanged':unchanged,
          'results':results,'summary':{'total':len(results),'executed':sum(r['executed'] for r in results),
                                     'matchesRecorded':sum(r['matchesRecorded'] for r in results)}}
args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report['summary']))
sys.exit(not unchanged or any(not r['executed'] or not r['matchesRecorded'] for r in results))
