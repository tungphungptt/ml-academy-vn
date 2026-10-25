import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateEmailOnly } from "@/lib/validation"; import { RESET_TTL_MS, hashToken, newToken } from "@/lib/resetToken";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateEmailOnly(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  const u = await db.user.findUnique({ where: { email: v.data.email } }); if (!u) return Response.json({ error: "Không có tài khoản với email này" }, { status: 404 });
  const token = newToken(); await db.passwordReset.create({ data: { userId: u.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) } });
  const origin = r.headers.get("origin") ?? `http://${r.headers.get("host")}`;
  return Response.json({ link: `${origin}/reset?token=${token}`, expiresInMinutes: RESET_TTL_MS / 60000 }); // chỉ hiển thị một lần; DB chỉ lưu băm
}
