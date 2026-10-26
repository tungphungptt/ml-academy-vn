"""Execute existing project notebooks cell by cell and save only real outputs.
Notebook source cells are authoritative; this runner never drops a project or cell.
Run with the pinned curriculum Python environment at repository root.
"""
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
os.chdir(root)
worker = '''import contextlib,io,json,sys
nb=json.load(open(sys.argv[1])); ns={}; count=0
for cell in nb['cells']:
 if cell['cell_type']!='code': continue
 count+=1; out=io.StringIO()
 with contextlib.redirect_stdout(out): exec(compile(''.join(cell['source']),sys.argv[1],'exec'),ns)
 cell['execution_count']=count
 cell['outputs']=[{'output_type':'stream','name':'stdout','text':out.getvalue().splitlines(True)}] if out.getvalue() else []
json.dump(nb,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
'''
pending=[]
with tempfile.TemporaryDirectory(prefix='ml-projects-') as tmp:
    env={**os.environ,'OMP_NUM_THREADS':'1','OPENBLAS_NUM_THREADS':'1','MPLBACKEND':'Agg','XDG_CACHE_HOME':tmp,'MPLCONFIGDIR':tmp+'/mpl','ML_ACADEMY_OUTPUT_DIR':tmp}
    for file in sorted(pathlib.Path('public/notebooks/projects').glob('*.ipynb')):
        output=pathlib.Path(tmp)/file.name
        r=subprocess.run([sys.executable,'-c',worker,str(file.resolve()),str(output)],env=env,text=True,capture_output=True,timeout=180)
        if r.returncode: raise RuntimeError(f'{file}: {r.stderr}')
        pending.append((file,output.read_text()+'\n'))
        print('OK',file,flush=True)
    for file,data in pending: file.write_text(data)
receipt=[{'file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'code_cells':sum(c['cell_type']=='code' for c in json.loads(p.read_text())['cells'])} for p,_ in pending]
pathlib.Path('docs/curriculum-project-execution.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=1)+'\n')
print(f'{len(pending)} project notebooks executed')
