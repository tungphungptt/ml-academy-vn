import fs from "fs"; import path from "path"; import CodeLab from "@/components/lab/CodeLab";
export const metadata = { title: "Code Lab | ML Academy VN" };
export default async function Lab({ searchParams }: { searchParams: Promise<{ lab?: string }> }) {
  const { lab } = await searchParams;
  const labs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/labs.json"), "utf8")) as any[];
  const withCode = labs.map(l => ({ ...l, code: Object.fromEntries(l.variants.map((v: string) => [v, fs.readFileSync(path.join(process.cwd(), "labs", l.id, `${v}.py`), "utf8")])) }));
  return <><h1>Code Lab</h1><p>Code Python chạy thật trong trình duyệt bằng Pyodide (NumPy, scikit-learn). Lần chạy đầu cần Internet để tải Pyodide. Code chạy trong Web Worker (có nút Stop, giới hạn 90 giây) nên không làm đơ trang.</p><CodeLab labs={withCode} initialLabId={lab} /></>;
}
