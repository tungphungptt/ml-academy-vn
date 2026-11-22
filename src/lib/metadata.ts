import type { Metadata } from "next";
export const SITE_URL = "https://neuralclone.site";
export const SITE_DESCRIPTION = "Học Machine Learning, Deep Learning và AI bằng tiếng Việt. Hiểu từ gốc qua bài học, công thức, Playground và Code Lab Python thực hành.";
export function pageMetadata(title: string, description: string, path: string, privatePage = false): Metadata {
  return {
    title: { absolute: `${title} | NeuralClone` }, description, alternates: { canonical: path },
    openGraph: { title: `${title} | NeuralClone`, description, url: path, siteName: "NeuralClone", locale: "vi_VN", type: "website", images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "NeuralClone — Học AI bằng tiếng Việt" }] },
    twitter: { card: "summary_large_image", title: `${title} | NeuralClone`, description, images: ["/social-preview.png"] },
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
  };
}
