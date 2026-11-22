import "katex/dist/katex.min.css";
import "./fonts.css";
import "./design-tokens.css";
import "./globals.css";
import "./apple-design.css";
import "./learning-experiments.css";
import "./workspace.css";
import "./exhibition.css";
import Nav from "@/components/Nav";
import ThemeBootstrap from "@/components/ThemeBootstrap";
import { navigationLinks } from "@/lib/navigation";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/metadata";
import type { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "NeuralClone — Học AI từ gốc", template: "%s | NeuralClone" },
  description: SITE_DESCRIPTION, applicationName: "NeuralClone",
  icons: { apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" } },
  openGraph: { title: "NeuralClone — Học AI từ gốc", description: SITE_DESCRIPTION, siteName: "NeuralClone", locale: "vi_VN", type: "website", images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "NeuralClone — Học AI bằng tiếng Việt" }] },
  twitter: { card: "summary_large_image", title: "NeuralClone — Học AI từ gốc", description: SITE_DESCRIPTION, images: ["/social-preview.png"] },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  return <html lang="vi" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning><head>
    <link rel="preload" href="/fonts/be-vietnam-pro-full-400-v2.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/neural-lora-normal-v1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <ThemeBootstrap /></head>
    <body><a className="skip" href="#main">Bỏ qua điều hướng</a><Nav links={navigationLinks} email={u?.email} admin={u?.role === "ADMIN"} /><main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><div className="footer-top"><div className="footer-about"><a className="brand" href="/"><span className="brand-symbol"><BrandMark /></span><span>NeuralClone<span className="brand-country">HỌC AI TỪ GỐC</span></span></a><p>Học AI bằng tiếng Việt.<br />Hiểu nguyên lý. Tự tay kiểm chứng.</p></div>
        <div><h2>Khám phá</h2><a href="/courses">Lộ trình học</a><a href="/playground">Playground</a><a href="/lab">Code Lab</a></div><div><h2>Thực hành & đọc thêm</h2><a href="/projects">Dự án</a><a href="/datasets">Thư viện dữ liệu</a><a href="/resources">Tài liệu tham khảo</a></div><a className="footer-cta" href="/courses">Bắt đầu từ một<br />điều bạn tò mò.<Icon name="external" /></a></div>
        <div className="footer-bottom"><span>NeuralClone · Nội dung tiếng Việt, có nguồn tham khảo trong từng bài.</span><span>Hiểu sâu hơn, xây điều mới.</span></div>
      </footer></body></html>;
}
