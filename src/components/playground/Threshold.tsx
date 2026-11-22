"use client";
import { useState } from "react";
import { THRESHOLD_SAMPLES, thresholdMetrics } from "@/lib/threshold";
export default function Threshold() {
  const [threshold, setThreshold] = useState(.5), [fpCost, setFpCost] = useState(1), [fnCost, setFnCost] = useState(4);
  const result = thresholdMetrics(THRESHOLD_SAMPLES, threshold, fpCost, fnCost);
  const percent = (value: number | null) => value === null ? "Không xác định" : `${(100*value).toFixed(1)}%`;
  const sx = (p: number) => 105 + 230*p;
  return <section className="threshold-lab"><h2>Ngưỡng quyết định và chi phí sai lầm</h2><p>Tám mẫu và điểm tự tạo để học cách tính; đây không phải xác suất đã được calibration. Quy tắc: score ≥ ngưỡng thì dự đoán dương.</p>
    <div className="threshold-workbench"><div className="threshold-controls">
    <label htmlFor="threshold-value"><span>Ngưỡng <output htmlFor="threshold-value">{threshold.toFixed(2)}</output></span><input id="threshold-value" aria-label="Ngưỡng quyết định" type="range" min={0} max={1} step={.05} value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label>
    <label htmlFor="threshold-fp"><span>Chi phí FP <output htmlFor="threshold-fp">{fpCost}</output></span><input id="threshold-fp" aria-label="Chi phí false positive" type="range" min={0} max={10} step={1} value={fpCost} onChange={e=>setFpCost(Number(e.target.value))}/></label>
    <label htmlFor="threshold-fn"><span>Chi phí FN <output htmlFor="threshold-fn">{fnCost}</output></span><input id="threshold-fn" aria-label="Chi phí false negative" type="range" min={0} max={10} step={1} value={fnCost} onChange={e=>setFnCost(Number(e.target.value))}/></label>
    <p>Đổi ngưỡng để quan sát dự đoán. Đổi chi phí để đánh giá cùng quyết định theo mục tiêu khác.</p>
    </div><figure className="threshold-chart"><div className="threshold-plot-scroll" tabIndex={0} role="region" aria-label="Biểu đồ ngưỡng; cuộn ngang để xem đầy đủ">
    <svg className="threshold-plot" viewBox="0 0 400 300" role="img" aria-label="Điểm của tám mẫu, nhãn thật và vạch ngưỡng quyết định">
      <title>Phân loại theo ngưỡng trên dữ liệu minh họa</title>
      {THRESHOLD_SAMPLES.map((sample,i)=>{const y=34+i*29, positive=sample.score>=threshold, color=sample.label===1?"var(--plot-1)":"var(--plot-2)";return <g key={i}><text x={8} y={y+4} fill="var(--mut)" fontSize={16}>Mẫu {i+1} ({sample.label===1?"+":"−"})</text><line x1={sx(0)} x2={sx(1)} y1={y} y2={y} stroke="var(--bd)"/><circle data-predicted={positive?"positive":"negative"} cx={sx(sample.score)} cy={y} r={5} fill={positive?color:"var(--surface-2)"} stroke={color} strokeWidth={2}/><text x={350} y={y+4} fill="var(--mut)" fontFamily="var(--font-code)" fontSize={16}>{sample.score.toFixed(2)}</text></g>;})}
      <line x1={sx(threshold)} x2={sx(threshold)} y1={18} y2={255} stroke="var(--fg)" strokeWidth={2} strokeDasharray="4 4"/>
      {[0,.25,.5,.75,1].map(v=><text key={v} x={sx(v)} y={280} textAnchor="middle" fill="var(--mut)" fontFamily="var(--font-code)" fontSize={15}>{v}</text>)}
    </svg></div><p className="plot-scroll-hint">Cuộn ngang nếu biểu đồ chưa hiển thị đủ.</p>
    <figcaption>Điểm đặc: dự đoán dương (+). Điểm rỗng: dự đoán âm (−). Dấu bên trái mỗi hàng là nhãn thật; vạch đứt là ngưỡng.</figcaption>
    </figure></div>
    <div className="threshold-summary" aria-live="polite"><div className="threshold-results"><table className="confusion-matrix"><caption>Ma trận nhầm lẫn</caption><thead><tr><th scope="col">Nhãn thật</th><th scope="col">Dự đoán +</th><th scope="col">Dự đoán −</th></tr></thead><tbody><tr><th scope="row">Dương (+)</th><td>TP <strong data-metric="tp">{result.tp}</strong></td><td>FN <strong data-metric="fn">{result.fn}</strong></td></tr><tr><th scope="row">Âm (−)</th><td>FP <strong data-metric="fp">{result.fp}</strong></td><td>TN <strong data-metric="tn">{result.tn}</strong></td></tr></tbody></table></div><div className="threshold-cost"><span>Tổng chi phí</span><strong data-metric="cost">{result.cost}</strong><p>FP × {fpCost} + FN × {fnCost}</p></div></div>
    <p>Precision: {percent(result.precision)} · Recall: {percent(result.recall)} · Chi phí = FP × {fpCost} + FN × {fnCost}.</p>
    {fpCost===0 && fnCost===0 && <p className="notice" role="status" aria-label="Chi phí bằng 0">Cả hai chi phí bằng 0: mọi ngưỡng đều có tổng chi phí 0 trên bảng này; tiêu chí chi phí không chọn được một ngưỡng duy nhất.</p>}
    <details className="threshold-table"><summary>Kiểm tra tám dự đoán</summary><table><caption>Cùng tám mẫu, ngưỡng {threshold.toFixed(2)}; dấu + là dương, − là âm.</caption><thead><tr><th scope="col">Mẫu</th><th scope="col">Điểm</th><th scope="col">Nhãn thật</th><th scope="col">Dự đoán</th></tr></thead><tbody>{THRESHOLD_SAMPLES.map((sample,i)=><tr key={i}><th scope="row">{i+1}</th><td>{sample.score.toFixed(2)}</td><td>{sample.label===1?"+":"−"}</td><td>{sample.score>=threshold?"+":"−"}</td></tr>)}</tbody></table></details>
    <p className="demo-question">Giảm ngưỡng từ 0,50 xuống 0,30. Giữ cùng score, vì sao recall và chi phí thay đổi? Với chi phí FP lớn hơn, chính sách còn hợp lý không?</p>
    <a className="text-link" href="/learn/imbalanced-learning">Đọc bài về dữ liệu lệch lớp, calibration và threshold →</a>
  </section>;
}
