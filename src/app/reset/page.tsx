import { pageMetadata } from "@/lib/metadata";
import ResetForm from "@/components/ResetForm";
import PageHeading from "@/components/PageHeading";
import Icon from "@/components/Icon";
import { singleQueryValues, type QueryParams } from "@/lib/queryParams";
export default async function Reset({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const token = singleQueryValues(await searchParams).token ?? "";
  return <><PageHeading eyebrow="BẢO VỆ TÀI KHOẢN" title="Đặt lại mật khẩu" description="Tạo mật khẩu mới bằng liên kết do quản trị viên cung cấp." />{/^[a-f0-9]{64}$/.test(token) ? <ResetForm token={token} /> : <p className="notice"><Icon name="alert" /><span>Liên kết không hợp lệ. Hãy nhờ quản trị viên tạo liên kết mới. <a href="/login">Về đăng nhập</a></span></p>}</>;
}

export const metadata = pageMetadata("Đặt lại mật khẩu", "Đặt lại mật khẩu tài khoản NeuralClone bằng liên kết từ quản trị viên.", "/reset", true);
