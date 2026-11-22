"""Execute every runnable Python block in the eight new lessons, independently.
No GPU, model download, network, or unverified benchmark output is involved.
"""
from pathlib import Path
import json, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
expected={
 'gradient-boosting':['[1.5, 1.5, 2.5, 2.5] 1.0 0.25'],
 'imbalanced-learning':['0.3 3 3 0 3\n0.5 2 2 1 6\n0.7 1 1 2 9'],
 'llm-foundations':['7 10 9','1.0397 2.8284'],
 'efficient-finetuning':['16777216 65536 0.390625\nTrue','[-7, -3, 1, 6] [-1.0, -0.4286, 0.1429, 0.8571]\n0.0571'],
 'rag-vector-search':["['split', 'adapter'] 0.5"],
 'llm-evaluation-security':['0.6667 0.5 0.5'],
 'mlops-reproducibility':['True True','0.3'],
 'responsible-ai':['A 0.5 0.5\nB 0.5 1.0'],
}
results=[]
for slug,outputs in expected.items():
 text=(ROOT/'content/lessons'/f'{slug}.md').read_text(encoding='utf-8')
 blocks=re.findall(r'^```python\n(.*?)^```',text,re.M|re.S)
 assert len(blocks)==len(outputs),(slug,len(blocks),len(outputs))
 for i,(code,target) in enumerate(zip(blocks,outputs)):
  run=subprocess.run([sys.executable,'-X','utf8','-c',code],cwd=ROOT,text=True,encoding='utf-8',capture_output=True,timeout=30)
  actual=run.stdout.strip()
  row={'lesson':slug,'block':i+1,'passed':run.returncode==0 and actual==target,'stdout':actual,'expected':target,'stderr':run.stderr}
  results.append(row);print(('PASS' if row['passed'] else 'FAIL'),slug,i+1,flush=True)
(ROOT/'docs/neuralclone-modern-execution.json').write_text(json.dumps({'python':sys.version,'results':results},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sys.exit(any(not r['passed'] for r in results))
