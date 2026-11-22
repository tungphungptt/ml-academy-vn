import { pageMetadata } from "@/lib/metadata";
import AuthForm from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/returnPath";
export default async function P({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) { return <AuthForm mode="login" returnTo={safeReturnPath((await searchParams).next)} />; }

export const metadata = pageMetadata("Đăng nhập", "Đăng nhập NeuralClone để tiếp tục học, lưu tiến độ, làm quiz và quản lý ghi chú.", "/login", false);
