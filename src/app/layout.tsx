import "katex/dist/katex.min.css";
import "./globals.css";
import Nav from "@/components/Nav";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/auth";
export const metadata = { title: "ML Academy VN", description: "Học Machine Learning và Deep Learning bằng tiếng Việt: công thức, ví dụ tính tay, code Python chạy được, playground tương tác." };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  return <html lang="vi" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: 'try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}' }} /></head>
    <body><a className="skip" href="#main">Bỏ qua điều hướng</a><Nav email={u?.email} admin={u?.role === "ADMIN"} /><main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><div className="footer-top"><div className="footer-about"><a className="brand" href="/"><span className="brand-symbol" aria-hidden="true">m<span>·</span></span><span>ML Academy<span className="brand-country">VIỆT NAM</span></span></a><p>Một không gian để hiểu từ gốc,<br />thực nghiệm và học sâu hơn.</p></div>
        <div><h2>Khám phá</h2><a href="/courses">Lộ trình học</a><a href="/playground">Playground</a><a href="/lab">Code Lab</a></div><div><h2>Thực hành & đọc thêm</h2><a href="/projects">Dự án</a><a href="/datasets">Thư viện dữ liệu</a><a href="/resources">Tài liệu tham khảo</a></div><a className="footer-cta" href="/courses">Bắt đầu từ một<br />điều bạn tò mò.<Icon name="external" /></a></div>
        <div className="footer-bottom"><span>Nội dung tự biên soạn bằng tiếng Việt. Nguồn tham khảo ghi trong từng bài.</span><span>Đọc · Hiểu · Kiểm chứng</span></div>
      </footer></body></html>;
}
