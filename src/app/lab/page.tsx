import { pageMetadata } from "@/lib/metadata";
import PageHeading from "@/components/PageHeading";
import fs from "fs"; import path from "path"; import CodeLab, { type Lab as LabData } from "@/components/lab/CodeLab";
import EmptyState from "@/components/EmptyState";
import { getLessons } from "@/lib/content";
import { singleQueryValues, type QueryParams } from "@/lib/queryParams";
export default async function Lab({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const { lab } = singleQueryValues(await searchParams);
  const labs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/labs.json"), "utf8")) as Omit<LabData, "code">[];
  const withCode = labs.map(l => ({ ...l, code: Object.fromEntries(l.variants.map((v: string) => [v, fs.readFileSync(path.join(process.cwd(), "labs", l.id, `${v}.py`), "utf8")])) }));
  const lessonTitles = Object.fromEntries(getLessons().map(l => [l.s, l.t]));
  return <><PageHeading eyebrow="HỌC BẰNG THỰC NGHIỆM" title="Code Lab" description="Đọc code, thay đổi một tham số, rồi đối chiếu kết quả. Chọn lab chạy trong trình duyệt hoặc bài CPU với notebook tải về." />{withCode.length ? <CodeLab labs={withCode} initialLabId={lab} lessonTitles={lessonTitles} /> : <EmptyState icon="code" title="Chưa có bài thực hành" description="Bạn có thể thử các mô hình tương tác trong Playground trước khi quay lại Code Lab." href="/playground" action="Thử Playground" />}</>;
}

export const metadata = pageMetadata("Code Lab", "Thực hành Python trong trình duyệt bằng Pyodide hoặc tải notebook để chạy CPU. Có code from scratch và phiên bản thư viện.", "/lab", false);
