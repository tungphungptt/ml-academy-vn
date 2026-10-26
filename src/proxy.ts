import { NextResponse, type NextRequest } from "next/server"; import { isSameOrigin } from "@/lib/origin";
export function proxy(req: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !isSameOrigin(req.headers.get("origin"), req.headers.get("host")))
    return NextResponse.json({ error: "Nguồn yêu cầu không hợp lệ" }, { status: 403 });
  return NextResponse.next();
}
export const config = { matcher: "/api/:path*" };
