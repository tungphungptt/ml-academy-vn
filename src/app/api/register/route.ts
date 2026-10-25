import { z } from "zod"; import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession } from "@/lib/auth"; import { clientIp, registerLimiter } from "@/lib/rateLimit";
const S = z.object({ email: z.string().email(), password: z.string().min(8).max(100) });
export async function POST(r: Request) {
  const rl = registerLimiter.check(clientIp(r.headers));
  if (!rl.ok) return Response.json({ error: `Tạo tài khoản quá nhiều lần. Hãy đợi ${Math.ceil(rl.retryAfter / 60)} phút.` }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  const p = S.safeParse(await r.json().catch(() => null));
  if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  if (await db.user.findUnique({ where: { email: p.data.email } })) return Response.json({ error: "Email đã tồn tại" }, { status: 409 });
  const u = await db.user.create({ data: { email: p.data.email, passwordHash: await bcrypt.hash(p.data.password, 12) } });
  await createSession(u.id, u.tokenVersion); return Response.json({ ok: true });
}
