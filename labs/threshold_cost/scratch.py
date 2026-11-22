"""Eight manually authored scores, not calibrated probabilities or a trained model.
Change thresholds/FP/FN costs; use validation (not test) when selecting a real policy.
"""
y = [1, 0, 1, 0, 0, 1, 0, 0]
scores = [0.9, 0.8, 0.6, 0.55, 0.4, 0.35, 0.2, 0.1]
fp_cost, fn_cost = 1, 4
for threshold in [0.3, 0.5, 0.7]:
    pred = [p >= threshold for p in scores]
    tp = sum(a == 1 and b for a, b in zip(y, pred))
    fp = sum(a == 0 and b for a, b in zip(y, pred))
    fn = sum(a == 1 and not b for a, b in zip(y, pred))
    print(f"threshold={threshold:.1f} TP={tp} FP={fp} FN={fn} cost={fp_cost*fp+fn_cost*fn}")
