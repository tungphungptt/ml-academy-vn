/** Chặn yêu cầu ghi từ trang web khác (CSRF): nếu có header Origin thì host phải trùng với Host của máy chủ. */
export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true;
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
