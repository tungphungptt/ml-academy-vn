import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession, currentUser } from "@/lib/auth"; import { validatePasswordChange } from "@/lib/validation"; import { loginLimiter } from "@/lib/rateLimit";
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const rl = loginLimiter.check("pw:" + u.id); if (!rl.ok) return Response.json({ error: `Thử quá nhiều lần. Hãy đợi ${rl.retryAfter} giây.` }, { status: 429 });
  const v = validatePasswordChange(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await bcrypt.compare(v.data.current, u.passwordHash))) return Response.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
  const nu = await db.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(v.data.next, 12), tokenVersion: { increment: 1 } } });
  await createSession(nu.id, nu.tokenVersion); // thiết bị hiện tại giữ đăng nhập, các thiết bị khác bị đăng xuất
  return Response.json({ ok: true });
}
