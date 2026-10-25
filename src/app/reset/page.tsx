import ResetForm from "@/components/ResetForm";
export const metadata = { title: "Đặt lại mật khẩu | ML Academy VN" };
export default function Reset({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";
  return <><h1>Đặt lại mật khẩu</h1>{/^[a-f0-9]{64}$/.test(token) ? <ResetForm token={token} /> : <p>Liên kết không hợp lệ. Hãy nhờ quản trị viên tạo liên kết mới.</p>}</>;
}
