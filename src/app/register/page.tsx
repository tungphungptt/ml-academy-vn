import { pageMetadata } from "@/lib/metadata";
import AuthForm from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/returnPath";
export default async function P({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) { return <AuthForm mode="register" returnTo={safeReturnPath((await searchParams).next)} />; }

export const metadata = pageMetadata("Đăng ký", "Tạo tài khoản NeuralClone để lưu tiến độ học Machine Learning, kết quả quiz và ghi chú riêng.", "/register", false);
