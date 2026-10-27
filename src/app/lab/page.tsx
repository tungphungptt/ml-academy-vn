import PageHeading from "@/components/PageHeading";
import fs from "fs"; import path from "path"; import CodeLab from "@/components/lab/CodeLab";
import { getLessons } from "@/lib/content";
export const metadata = { title: "Code Lab | ML Academy VN" };
export default async function Lab({ searchParams }: { searchParams: Promise<{ lab?: string }> }) {
  const { lab } = await searchParams;
  const labs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/labs.json"), "utf8")) as any[];
  const withCode = labs.map(l => ({ ...l, code: Object.fromEntries(l.variants.map((v: string) => [v, fs.readFileSync(path.join(process.cwd(), "labs", l.id, `${v}.py`), "utf8")])) }));
  const lessonTitles = Object.fromEntries(getLessons().map(l => [l.s, l.t]));
  return <><PageHeading eyebrow="HỌC BẰNG THỰC NGHIỆM" title="Code Lab" description="Đọc code, thay đổi một tham số, rồi đối chiếu kết quả. Chọn lab chạy trong trình duyệt hoặc bài CPU với notebook tải về." /><CodeLab labs={withCode} initialLabId={lab} lessonTitles={lessonTitles} /></>;
}
