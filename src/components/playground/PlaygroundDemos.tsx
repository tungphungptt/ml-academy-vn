"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const loading = () => <p role="status">Đang mở thí nghiệm…</p>;
const DEMOS = [
  { id: "linreg", title: "Hồi quy", name: "Linear Regression", Demo: dynamic(() => import("./LinReg"), { loading }) },
  { id: "knn", title: "KNN", name: "KNN", Demo: dynamic(() => import("./Knn"), { loading }) },
  { id: "kmeans", title: "Phân cụm", name: "K-Means", Demo: dynamic(() => import("./KMeans"), { loading }) },
  { id: "tree", title: "Cây quyết định", name: "Decision Tree", Demo: dynamic(() => import("./Tree"), { loading }) },
  { id: "pca", title: "Giảm chiều", name: "PCA", Demo: dynamic(() => import("./Pca"), { loading }) },
  { id: "nn", title: "Mạng nơ-ron", name: "Neural Network", Demo: dynamic(() => import("./Nn"), { loading }) },
  { id: "threshold", title: "Ngưỡng quyết định", name: "Chi phí FP / FN", Demo: dynamic(() => import("./Threshold"), { loading }) },
];
export default function PlaygroundDemos() {
  const [active, setActive] = useState("linreg");
  useEffect(() => {
    const sync = () => { const id = window.location.hash.slice(1); setActive(DEMOS.some(d => d.id === id) ? id : "linreg"); };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const { Demo, id } = DEMOS.find(d => d.id === active)!;
  return <><nav className="playground-nav" aria-label="Chọn thuật toán">{DEMOS.map((d, i) => <a key={d.id} href={`#${d.id}`} aria-current={d.id === active ? "location" : undefined} onClick={() => setActive(d.id)}><span>{String(i + 1).padStart(2, "0")}</span><strong>{d.title}</strong><small>{d.name}</small></a>)}</nav><div id={id} className="card demo"><Demo /></div></>;
}
