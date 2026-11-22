"""Execute two original labs, then package exact source/stdout in notebooks.
Idempotent append by lab ID; existing lab metadata/output is not overwritten.
"""
from pathlib import Path
import hashlib, json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
labs=json.loads((ROOT/'content/labs.json').read_text(encoding='utf-8'))
definitions=[
 ('threshold_cost','Ngưỡng quyết định và chi phí FP/FN',['imbalanced-learning','responsible-ai'],'Tính confusion counts và chi phí trên tám score tự tạo. Không huấn luyện mô hình hoặc dùng test để chọn ngưỡng.'),
 ('rag_retrieval','Truy xuất văn bản: baseline TF-IDF',['rag-vector-search','llm-evaluation-security'],'Truy xuất thật bằng TF-IDF/cosine trên ba tài liệu tự biên soạn, áp allowed IDs và từ chối khi không có từ vựng chung. Không có mô hình sinh câu trả lời.'),
]
results=[]
for lab_id,title,slugs,description in definitions:
 source=(ROOT/'labs'/lab_id/'scratch.py').read_text(encoding='utf-8')
 run=subprocess.run([sys.executable,'-X','utf8','-c',source],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',timeout=30,check=True)
 stdout=run.stdout.strip();digest=hashlib.sha256(source.encode()).hexdigest()
 notebook=f'/notebooks/{lab_id}_scratch.ipynb'
 nb={'cells':[{'cell_type':'markdown','id':'purpose','metadata':{},'source':[f'# {title}\n',description+'\n','Dữ liệu minh họa, không phải benchmark production.\n']},{'cell_type':'code','id':'implementation','metadata':{},'execution_count':1,'source':source.splitlines(keepends=True),'outputs':[{'output_type':'stream','name':'stdout','text':(stdout+'\n').splitlines(keepends=True)}]}],
 'metadata':{'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'},'language_info':{'name':'python','version':sys.version.split()[0]}},'nbformat':4,'nbformat_minor':5}
 (ROOT/'public'/notebook.lstrip('/')).write_text(json.dumps(nb,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
 entry={'id':lab_id,'title':title,'description':description,'lessonSlugs':slugs,'runtime':'pyodide','variants':['scratch'],'expected':{'scratch':stdout},'notebooks':{'scratch':notebook},'verification':{'scratch':{'sha256':digest,'python':sys.version.split()[0],'command':f'python labs/{lab_id}/scratch.py','passed':True}}}
 old=next((l for l in labs if l['id']==lab_id),None)
 if old is None:labs.append(entry)
 elif old!=entry:raise RuntimeError(f'{lab_id}: existing lab differs; review instead of overwrite')
 results.append({'lab':lab_id,'passed':True,'stdout':stdout,'sha256':digest});print('PASS',lab_id,stdout,sep='\n')
(ROOT/'content/labs.json').write_text(json.dumps(labs,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
(ROOT/'docs/neuralclone-new-lab-execution.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
