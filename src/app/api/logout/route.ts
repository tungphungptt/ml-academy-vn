import { cookies } from "next/headers"; import { NextResponse } from "next/server";
export async function POST(req: Request) {
  (await cookies()).delete("session");
  return NextResponse.redirect(new URL("/", req.url), 303);
}
