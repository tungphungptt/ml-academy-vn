import LinReg from "@/components/playground/LinReg"; import Knn from "@/components/playground/Knn"; import KMeans from "@/components/playground/KMeans";
import Tree from "@/components/playground/Tree"; import Pca from "@/components/playground/Pca"; import Nn from "@/components/playground/Nn";
export const metadata = { title: "Playground | ML Academy VN" };
const DEMOS = [["linreg", "Linear Regression"], ["knn", "KNN"], ["kmeans", "K-Means"], ["tree", "Decision Tree"], ["pca", "PCA"], ["nn", "Neural Network"]];
export default function Playground() {
  return <><h1>Playground thuật toán</h1><p className="mut">Mọi biểu đồ được tính trực tiếp trong trình duyệt từ dữ liệu mẫu cố định (seed); không có kết quả giả. Kéo thanh trượt để thấy tác động ngay.</p>
    <div className="chips">{DEMOS.map(([id, t]) => <a key={id} href={`#${id}`} className="btn">{t}</a>)}</div>
    <div id="linreg" className="card demo"><LinReg /></div><div id="knn" className="card demo"><Knn /></div><div id="kmeans" className="card demo"><KMeans /></div>
    <div id="tree" className="card demo"><Tree /></div><div id="pca" className="card demo"><Pca /></div><div id="nn" className="card demo"><Nn /></div></>;
}
