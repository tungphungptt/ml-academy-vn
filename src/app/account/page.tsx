import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import PasswordForm from "@/components/PasswordForm";
import PageHeading from "@/components/PageHeading";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tài khoản | ML Academy VN" };
export default async function Account() {
  const u = await currentUser(); if (!u) redirect("/login");
  return <><PageHeading eyebrow="KHÔNG GIAN RIÊNG CỦA BẠN" title="Tài khoản" description="Quản lý thông tin đăng nhập để tiếp tục học trên các thiết bị của bạn." /><div className="account-layout"><section className="account-profile"><p className="eyebrow">THÔNG TIN TÀI KHOẢN</p><p><strong>Email</strong><br />{u.email}</p><p><strong>Vai trò</strong><br />{u.role === "ADMIN" ? "Quản trị viên" : "Người học"}</p></section><section className="account-section"><h2>Đổi mật khẩu</h2><p className="mut">Khi đổi mật khẩu, các thiết bị khác sẽ bị đăng xuất.</p><PasswordForm /></section></div></>;
}
