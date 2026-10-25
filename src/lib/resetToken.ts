import { createHash, randomBytes } from "node:crypto";
export const RESET_TTL_MS = 60 * 60 * 1000;
export const newToken = () => randomBytes(32).toString("hex");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex"); // chỉ lưu băm của token trong DB
export function isUsable(rec: { expiresAt: Date; usedAt: Date | null } | null, now = new Date()): boolean { return !!rec && !rec.usedAt && rec.expiresAt.getTime() > now.getTime(); }
