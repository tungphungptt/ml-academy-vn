import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
const key = () => {
  const s = process.env.SESSION_SECRET ?? "";
  if (s.length < 32) throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự (xem .env.example)");
  return new TextEncoder().encode(s);
};
// Cookie "secure" chỉ gửi qua HTTPS. Khi chạy production trên HTTP (LAN, localhost với Safari) đặt COOKIE_SECURE=false.
const secureCookie = () => (process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE !== "false" : process.env.NODE_ENV === "production");
export async function createSession(userId: string, version = 0) {
  const t = await new SignJWT({ sub: userId, v: version }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("session", t, { httpOnly: true, sameSite: "lax", secure: secureCookie(), path: "/", maxAge: 604800 });
}
export async function currentUser() {
  const t = cookies().get("session")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key()); const u = await db.user.findUnique({ where: { id: String(payload.sub) } });
    return u && Number(payload.v ?? 0) === u.tokenVersion ? u : null; // đổi/đặt lại mật khẩu tăng tokenVersion nên phiên cũ mất hiệu lực
  } catch { return null; }
}
export async function requireAdmin() { const u = await currentUser(); return u?.role === "ADMIN" ? u : null; }
