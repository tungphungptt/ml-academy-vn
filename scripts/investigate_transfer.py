"""Controlled CPU transfer audit. Never rewrite lab, registry or notebook outputs.
Run with the pinned CPU environment. Artifacts stay under .local; public report
contains toy Digits indices/logits, versions and reproducibility hashes only.
"""
import argparse
import contextlib
from datetime import datetime, timezone
import hashlib
import importlib.metadata
import inspect
import io
import json
import os
from pathlib import Path
import platform
import runpy
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--worker', type=Path)
parser.add_argument('--backend', choices=['default', 'mkldnn-off'], default='default')
parser.add_argument('--report', type=Path, default=ROOT/'docs/neuralclone-transfer-investigation.json')
args = parser.parse_args()

def sha(data):
    return hashlib.sha256(data).hexdigest()

def worker(folder, backend):
    import numpy as np
    import torch
    from torch import nn
    import torch.nn.functional as functional

    folder.mkdir(parents=True, exist_ok=True)
    os.environ['ML_ACADEMY_OUTPUT_DIR'] = str(folder)
    os.environ['MPLCONFIGDIR'] = str(folder/'mpl')
    if backend == 'mkldnn-off':
        torch.backends.mkldnn.enabled = False

    def array_hash(values):
        a = np.asarray(values)
        a = np.ascontiguousarray(a.astype(a.dtype.newbyteorder('<'), copy=False))
        return sha(json.dumps({'shape':a.shape,'dtype':a.dtype.str},sort_keys=True).encode()+a.tobytes())

    def model_hash(model_or_state):
        state = model_or_state.state_dict() if hasattr(model_or_state, 'state_dict') else model_or_state
        payload = b''
        for key in sorted(state):
            t = state[key].detach().cpu().contiguous()
            payload += key.encode()+str(t.dtype).encode()+str(tuple(t.shape)).encode()+t.numpy().tobytes()
        return sha(payload)

    timeline, checkpoints = [], []
    original_ce, original_load = functional.cross_entropy, nn.Module.load_state_dict

    def observe_ce(*a, **kw):
        value = original_ce(*a, **kw)
        caller = inspect.currentframe().f_back
        if caller.f_code.co_name == 'fit' and caller.f_code.co_filename.endswith('transfer_cpu/library.py') and not torch.is_grad_enabled():
            timeline.append({'stage':'frozen' if caller.f_locals['freeze'] else 'fine-tune',
                             'epoch':caller.f_locals['_']+1,'validationLoss':value.item(),
                             'stateHash':model_hash(caller.f_globals['net'])})
        return value

    def observe_load(module, state, *a, **kw):
        value = original_load(module, state, *a, **kw)
        caller = inspect.currentframe().f_back
        if caller.f_code.co_name == 'fit' and caller.f_code.co_filename.endswith('transfer_cpu/library.py'):
            stage = 'frozen' if caller.f_locals['freeze'] else 'fine-tune'
            entries = [r for r in timeline if r['stage']==stage]
            selected = min(entries,key=lambda r:r['validationLoss'])
            restored_hash = model_hash(module)
            assert restored_hash == selected['stateHash']
            checkpoints.append({'stage':stage,'selectedEpoch':selected['epoch'],
                                'validationLoss':caller.f_locals['best'],'stateHash':restored_hash,
                                'selectedByValidation':True,'learningRates':[g['lr'] for g in caller.f_locals['optimizer'].param_groups]})
        return value

    functional.cross_entropy, nn.Module.load_state_dict = observe_ce, observe_load
    stdout = io.StringIO()
    original_argv = sys.argv
    try:
        sys.argv = ['labs/transfer_cpu/library.py']
        with contextlib.redirect_stdout(stdout):
            namespace = runpy.run_path('labs/transfer_cpu/library.py', run_name='__main__')
    finally:
        sys.argv = original_argv
        functional.cross_entropy, nn.Module.load_state_dict = original_ce, original_load
    net, frozen = namespace['net'], namespace['frozen']
    ids = namespace['test']
    assert not net.training and not frozen.training
    assert not set(namespace['train']) & set(ids)
    assert not set(namespace['val']) & set(ids)
    with torch.no_grad():
        logits = net(namespace['images'][ids]).cpu().numpy()
        frozen_logits = frozen(namespace['images'][ids]).cpu().numpy()
    target = namespace['y'][ids].numpy()
    predictions, frozen_predictions = logits.argmax(1), frozen_logits.argmax(1)
    samples = [{'datasetIndex':int(i),'digit':int(namespace['digits'][i]),'target':int(y),
                'prediction':int(p),'frozenPrediction':int(f),'logits':[float(x) for x in scores]}
               for i,y,p,f,scores in zip(ids,target,predictions,frozen_predictions,logits)]
    source_state = torch.load(folder/'cnn.pt',map_location='cpu',weights_only=True)
    record = {'backend':backend,'versions':{'python':platform.python_version(),
              **{n:importlib.metadata.version(n) for n in ['torch','numpy','scipy','scikit-learn','pandas']}},
              'runtime':{'platform':platform.platform(),'processor':platform.processor(),
                         'threads':torch.get_num_threads(),'interopThreads':torch.get_num_interop_threads(),
                         'deterministicAlgorithms':torch.are_deterministic_algorithms_enabled(),
                         'mkldnnEnabled':torch.backends.mkldnn.enabled,'mkldnnDeterministic':torch.backends.mkldnn.deterministic,
                         'matmulPrecision':torch.get_float32_matmul_precision(),'cpuCapability':torch.backends.cpu.get_cpu_capability(),
                         'torchGitVersion':torch.version.git_version,'torchBuild':torch.__config__.show()},
              'stdout':stdout.getvalue().strip(),'data':{'X':array_hash(namespace['X']),'digits':array_hash(namespace['digits']),
              'images':array_hash(namespace['images'].numpy()),'targets':array_hash(namespace['y'].numpy()),
              'trainIds':array_hash(namespace['train']),'validationIds':array_hash(namespace['val']),'testIds':array_hash(ids),
              'train':len(namespace['train']),'validation':len(namespace['val']),'test':len(ids),
              'preprocessing':'X.reshape(-1,1,8,8)/16 converted to float32; parity digit % 2'},
              'checkpoints':checkpoints,'validationTimeline':timeline,'pretrainedStateHash':model_hash(source_state),
              'fineTuneStateHash':model_hash(net),'frozenStateHash':model_hash(frozen),
              'correct':int((predictions==target).sum()),'total':len(ids),'frozenCorrect':int((frozen_predictions==target).sum()),
              'predictionHash':array_hash(predictions),'logitsHash':array_hash(logits),'samples':samples}
    (folder/'result.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'correct':record['correct'],'total':record['total'],'backend':backend}),flush=True)

if args.worker:
    os.chdir(ROOT)
    worker(args.worker.resolve(),args.backend)
else:
    source = ROOT/'labs/transfer_cpu/library.py'
    registry = json.loads((ROOT/'content/labs.json').read_text(encoding='utf-8'))
    baseline = next(l for l in registry if l['id']=='transfer_cpu')
    nb = json.loads((ROOT/'public/notebooks/transfer_cpu_library.ipynb').read_text(encoding='utf-8'))
    nb_code = ''.join(next(c['source'] for c in nb['cells'] if c['cell_type']=='code'))
    artifacts = ROOT/'.local/transfer-investigation'
    artifacts.mkdir(parents=True,exist_ok=True)
    runs=[]
    # Predetermined before looking at results; not hyperparameter/test tuning.
    for backend,count in [('default',3),('mkldnn-off',2)]:
        for i in range(count):
            folder=artifacts/f'{backend}-{i+1}'
            env={**os.environ,'PYTHONUTF8':'1','OMP_NUM_THREADS':'1','OPENBLAS_NUM_THREADS':'1','MKL_NUM_THREADS':'1'}
            r=subprocess.run([sys.executable,'-X','utf8',str(Path(__file__).resolve()),'--worker',str(folder),'--backend',backend],
                             cwd=ROOT,env=env,text=True,encoding='utf-8',capture_output=True,timeout=240)
            if r.returncode:
                raise RuntimeError(r.stdout+'\n'+r.stderr)
            row=json.loads((folder/'result.json').read_text(encoding='utf-8'));row['run']=folder.name
            runs.append(row);print(r.stdout.strip(),flush=True)
    reference=runs[0]
    dependencies=[]
    for lab_id in ['transfer_cpu','cnn_cpu']:
        entry=next(l for l in registry if l['id']==lab_id)
        code=(ROOT/'labs'/lab_id/'library.py').read_bytes()
        notebook=json.loads((ROOT/'public/notebooks'/f'{lab_id}_library.ipynb').read_text(encoding='utf-8'))
        notebook_code=''.join(next(c['source'] for c in notebook['cells'] if c['cell_type']=='code'))
        dependencies.append({'lab':lab_id,'rawHash':sha(code),'lfHash':sha(code.replace(b'\r\n',b'\n')),
                             'recordedHash':entry['verification']['library']['sha256'],'notebookCodeHash':sha(notebook_code.encode())})
    comparisons=[]
    ref_predictions={r['datasetIndex']:r for r in reference['samples']}
    for r in runs[1:]:
        differences=[{'datasetIndex':s['datasetIndex'],'target':s['target'],
                      'referencePrediction':ref_predictions[s['datasetIndex']]['prediction'],'prediction':s['prediction'],
                      'referenceLogits':ref_predictions[s['datasetIndex']]['logits'],'logits':s['logits']}
                     for s in r['samples'] if s['prediction']!=ref_predictions[s['datasetIndex']]['prediction']]
        comparisons.append({'reference':reference['run'],'run':r['run'],'sameDataAndSplits':r['data']==reference['data'],
                            'samePretrainedState':r['pretrainedStateHash']==reference['pretrainedStateHash'],
                            'sameFinalState':r['fineTuneStateHash']==reference['fineTuneStateHash'],
                            'sameLogits':r['logitsHash']==reference['logitsHash'],'predictionDifferences':differences})
    report={'checkedAt':datetime.now(timezone.utc).isoformat(),
            'provenance':{'rawSourceHash':sha(source.read_bytes()),'lfSourceHash':sha(source.read_bytes().replace(b'\r\n',b'\n')),
                          'recordedSourceHash':baseline['verification']['library']['sha256'],'notebookCodeHash':sha(nb_code.encode()),
                          'baselineVersions':baseline['verification']['library']['versions'],'baselineStdout':baseline['expected']['library'],
                          'baselinePredictionsAvailable':False,'baselineCheckpointAvailable':False,
                          'limitation':'Historical handoff has aggregate stdout/source hash/versions, not per-sample predictions, logits or checkpoint tensors.'},
            'sourceDependencies':dependencies,'runs':runs,'comparisons':comparisons,'historicalOutputsRewritten':False}
    args.report.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'runs':[(r['run'],r['correct'],r['total']) for r in runs],
                      'differentPredictionCounts':[len(c['predictionDifferences']) for c in comparisons]}))
