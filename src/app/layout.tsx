import "katex/dist/katex.min.css"; import "./globals.css";
import Nav from "@/components/Nav"; import { currentUser } from "@/lib/auth";
export const metadata = { title: "ML Academy VN", description: "Học Machine Learning và Deep Learning bằng tiếng Việt: công thức, ví dụ tính tay, code Python chạy được, playground tương tác." };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  return <html lang="vi" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: 'try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}' }} /></head>
    <body><a className="skip" href="#main">Bỏ qua điều hướng</a><Nav email={u?.email} admin={u?.role === "ADMIN"} /><main id="main">{children}</main>
      <footer><div className="foot"><div><b>◆ ML Academy VN</b><br />Nội dung tự biên soạn bằng tiếng Việt; hình minh họa tự vẽ từ số liệu thật; nguồn tham khảo ghi ở cuối mỗi bài.</div>
        <div><a href="/courses">Khóa học</a><br /><a href="/playground">Playground</a><br /><a href="/lab">Code Lab</a></div><div><a href="/projects">Dự án</a><br /><a href="/datasets">Dữ liệu</a><br /><a href="/resources">Tài liệu</a></div></div></footer></body></html>;
}
