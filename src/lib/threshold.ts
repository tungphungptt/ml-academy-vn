export type ScoredSample = { score: number; label: 0 | 1 };
export const THRESHOLD_SAMPLES: ScoredSample[] = [
  { score: .9, label: 1 }, { score: .8, label: 0 }, { score: .6, label: 1 }, { score: .55, label: 0 },
  { score: .4, label: 0 }, { score: .35, label: 1 }, { score: .2, label: 0 }, { score: .1, label: 0 },
];
export function thresholdMetrics(samples: ScoredSample[], threshold: number, falsePositiveCost: number, falseNegativeCost: number) {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1 || [falsePositiveCost, falseNegativeCost].some(c => !Number.isFinite(c) || c < 0) || samples.some(s => !Number.isFinite(s.score) || s.score < 0 || s.score > 1 || (s.label !== 0 && s.label !== 1))) throw new RangeError("Điểm/ngưỡng phải thuộc [0,1], nhãn nhị phân và chi phí hữu hạn không âm.");
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const sample of samples) {
    const positive = sample.score >= threshold;
    if (sample.label === 1) { if (positive) tp++; else fn++; }
    else if (positive) fp++; else tn++;
  }
  return { tp, fp, tn, fn, precision: tp + fp ? tp / (tp + fp) : null, recall: tp + fn ? tp / (tp + fn) : null, cost: fp * falsePositiveCost + fn * falseNegativeCost };
}
