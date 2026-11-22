import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession, currentUser } from "@/lib/auth"; import { validatePasswordChange } from "@/lib/validation"; import { loginLimiter } from "@/lib/rateLimit";
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const rl = loginLimiter.check("pw:" + u.id); if (!rl.ok) return Response.json({ error: `Thử quá nhiều lần. Hãy đợi ${rl.retryAfter} giây.` }, { status: 429 });
  const v = validatePasswordChange(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await bcrypt.compare(v.data.current, u.passwordHash))) return Response.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
  const passwordHash = await bcrypt.hash(v.data.next, 12);
  const changed = await db.$transaction(async tx => {
    const result = await tx.user.updateMany({ where: { id: u.id, tokenVersion: u.tokenVersion, passwordHash: u.passwordHash }, data: { passwordHash, tokenVersion: { increment: 1 } } });
    if (result.count !== 1) return false;
    await tx.passwordReset.updateMany({ where: { userId: u.id, usedAt: null }, data: { usedAt: new Date() } });
    return true;
  });
  if (!changed) return Response.json({ error: "Thông tin đăng nhập đã thay đổi. Hãy đăng nhập lại." }, { status: 409 });
  await createSession(u.id, u.tokenVersion + 1); // thiết bị hiện tại giữ đăng nhập, các thiết bị khác bị đăng xuất
  return Response.json({ ok: true });
}
