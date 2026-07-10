import { NextResponse } from "next/server";
import { COOKIE_NAME, makeToken, verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }
  const token = makeToken(email);
  const session = verifyToken(token)!;
  const res = NextResponse.json({ email: session.email, role: session.role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
