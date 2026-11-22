// Enforce the policy. Explicitly allow the existing Cloudflare analytics beacon.
const dev = process.env.NODE_ENV !== "production";
const csp = ["default-src 'self'", `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""} https://cdn.jsdelivr.net https://static.cloudflareinsights.com`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "connect-src 'self' https://cdn.jsdelivr.net https://cloudflareinsights.com", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'"].join("; ");
const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
module.exports = {
  // Named tunnel origin for remote development; keep other origins blocked.
  allowedDevOrigins: ["neuralclone.site", "127.0.0.1"],
  distDir: process.env.NEURALCLONE_E2E === "1" ? ".next-e2e" : ".next",
  reactStrictMode: true, poweredByHeader: false,
  async headers() { return [{ source: "/:path*", headers: security }, { source: "/img/:path*", headers: cache }, { source: "/notebooks/:path*", headers: cache }]; },
};
