import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { roadmapForRole, listChangelog } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const data = roadmapForRole(s.role);
  return NextResponse.json({
    role: s.role,
    email: s.email,
    ...data,
    changelog: listChangelog(30),
  });
}
