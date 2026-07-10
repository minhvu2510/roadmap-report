import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listChangelog } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  return NextResponse.json({ changelog: listChangelog(100) });
}
