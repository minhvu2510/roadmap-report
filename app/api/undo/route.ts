import { NextResponse } from "next/server";
import { withAdmin } from "../_guard";
import { undoLast } from "@/lib/repo";

export const POST = withAdmin(async (s) => {
  const r = undoLast(s.email);
  if (!r.undone) return NextResponse.json({ error: "Không có thao tác để hoàn tác" }, { status: 400 });
  return NextResponse.json(r);
});
