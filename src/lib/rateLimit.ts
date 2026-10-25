/** Giới hạn tần suất trong bộ nhớ (một tiến trình). Với nhiều bản triển khai song song cần kho dùng chung (vd. Redis). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private max: number; private windowMs: number;
  constructor(max: number, windowMs: number) { this.max = max; this.windowMs = windowMs; }
  check(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
    const arr = (this.hits.get(key) ?? []).filter(t => now - t < this.windowMs);
    if (arr.length >= this.max) { this.hits.set(key, arr); return { ok: false, retryAfter: Math.max(1, Math.ceil((arr[0] + this.windowMs - now) / 1000)) }; }
    arr.push(now); this.hits.set(key, arr);
    if (this.hits.size > 5000) for (const [k, v] of this.hits) if (v.every(t => now - t >= this.windowMs)) this.hits.delete(k);
    return { ok: true, retryAfter: 0 };
  }
}
export const loginLimiter = new RateLimiter(8, 10 * 60_000);
export const registerLimiter = new RateLimiter(5, 60 * 60_000);
export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
