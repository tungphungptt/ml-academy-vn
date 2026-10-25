// Content-Security-Policy ở chế độ CHỈ BÁO CÁO: không chặn gì, chỉ ghi vi phạm vào Console. Sau khi thử Code Lab (Pyodide) mà không thấy vi phạm, có thể đổi tên header thành "Content-Security-Policy".
const dev = process.env.NODE_ENV !== "production";
const csp = ["default-src 'self'", `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""} https://cdn.jsdelivr.net`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "connect-src 'self' https://cdn.jsdelivr.net", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'"].join("; ");
const security = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
module.exports = {
  reactStrictMode: true, poweredByHeader: false,
  async headers() { return [{ source: "/:path*", headers: security }, { source: "/img/:path*", headers: cache }, { source: "/notebooks/:path*", headers: cache }]; },
};
