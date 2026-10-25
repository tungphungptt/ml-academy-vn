import { redirect } from "next/navigation"; import { currentUser } from "@/lib/auth"; import PasswordForm from "@/components/PasswordForm";
export const dynamic = "force-dynamic"; export const metadata = { title: "Tài khoản | ML Academy VN" };
export default async function Account() {
  const u = await currentUser(); if (!u) redirect("/login");
  return <><h1>Tài khoản</h1><div className="card"><p><b>Email:</b> {u.email}</p><p><b>Vai trò:</b> {u.role === "ADMIN" ? "Quản trị viên" : "Người học"}</p></div>
    <h2>Đổi mật khẩu</h2><PasswordForm /><p className="mut">Khi đổi mật khẩu, các thiết bị khác sẽ bị đăng xuất.</p></>;
}
