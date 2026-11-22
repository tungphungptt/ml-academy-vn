import { NextResponse, type NextRequest } from "next/server"; import { isSameOrigin } from "@/lib/origin";
export function proxy(req: NextRequest) {
  if (process.env.NODE_ENV === "development" && req.nextUrl.pathname.startsWith("/_next/static/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
    return response;
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !isSameOrigin(req.headers.get("origin"), req.headers.get("host")))
    return NextResponse.json({ error: "Nguồn yêu cầu không hợp lệ" }, { status: 403 });
  return NextResponse.next();
}
export const config = { matcher: ["/api/:path*", "/_next/static/:path*"] };
