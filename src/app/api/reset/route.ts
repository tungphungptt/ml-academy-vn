import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { validateReset } from "@/lib/validation"; import { hashToken, isUsable } from "@/lib/resetToken"; import { RateLimiter, clientIp } from "@/lib/rateLimit";
const limiter = new RateLimiter(10, 60 * 60_000);
export async function POST(r: Request) {
  const rl = limiter.check(clientIp(r.headers)); if (!rl.ok) return Response.json({ error: `Thử quá nhiều lần. Hãy đợi ${rl.retryAfter} giây.` }, { status: 429 });
  const v = validateReset(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  const rec = await db.passwordReset.findUnique({ where: { tokenHash: hashToken(v.data.token) } });
  if (!rec || !isUsable(rec)) return Response.json({ error: "Liên kết không hợp lệ hoặc đã hết hạn" }, { status: 400 });
  const hash = await bcrypt.hash(v.data.next, 12); const now = new Date();
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: hash, tokenVersion: { increment: 1 } } }),
    db.passwordReset.updateMany({ where: { userId: rec.userId, usedAt: null }, data: { usedAt: now } }),
  ]);
  return Response.json({ ok: true });
}
