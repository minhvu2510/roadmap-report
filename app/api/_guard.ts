import { NextResponse } from "next/server";
import { getSession, Session } from "@/lib/auth";

export function withAdmin(fn: (s: Session, req: Request, ctx: any) => Promise<Response> | Response) {
  return async (req: Request, ctx: any) => {
    const s = getSession();
    if (!s) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    if (s.role !== "admin") return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    try {
      return await fn(s, req, ctx);
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "Lỗi" }, { status: e?.status || 500 });
    }
  };
}
