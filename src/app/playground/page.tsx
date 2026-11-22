import { pageMetadata } from "@/lib/metadata";
import PageHeading from "@/components/PageHeading";
import PlaygroundDemos from "@/components/playground/PlaygroundDemos";
export default function Playground() {
  return <><PageHeading eyebrow="NHÌN THẤY CÁCH MÔ HÌNH HỌC" title="Playground thuật toán" description="Kéo thanh trượt, đổi một tham số và quan sát dự đoán thay đổi. Bảy thí nghiệm tính trực tiếp trong trình duyệt; dữ liệu có seed cố định hoặc được ghi rõ là minh họa." />
    <PlaygroundDemos /></>;
}

export const metadata = pageMetadata("Playground thuật toán", "Tương tác với hồi quy, KNN, K-Means, cây quyết định, PCA và mạng nơ-ron. Thay tham số và kiểm chứng kết quả tính thật.", "/playground", false);
