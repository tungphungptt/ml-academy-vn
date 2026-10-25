import { z } from "zod"; import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession } from "@/lib/auth"; import { clientIp, loginLimiter } from "@/lib/rateLimit";
const S = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(r: Request) {
  const ip = clientIp(r.headers); const rl = loginLimiter.check(ip);
  if (!rl.ok) return Response.json({ error: `Thử quá nhiều lần. Hãy đợi ${rl.retryAfter} giây.` }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  const p = S.safeParse(await r.json().catch(() => null));
  const u = p.success ? await db.user.findUnique({ where: { email: p.data.email } }) : null;
  if (!p.success || !u || !(await bcrypt.compare(p.data.password, u.passwordHash))) return Response.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });
  await createSession(u.id, u.tokenVersion); return Response.json({ ok: true });
}
