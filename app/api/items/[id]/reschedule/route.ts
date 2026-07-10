import { NextResponse } from "next/server";
import { withAdmin } from "../../../_guard";
import { rescheduleItem } from "@/lib/repo";

export const POST = withAdmin(async (s, req, ctx) => {
  const body = await req.json();
  const start = Number(body.start);
  const len = Number(body.len);
  const reason = String(body.reason || "").trim();
  if (Number.isNaN(start) || Number.isNaN(len)) {
    return NextResponse.json({ error: "start/len không hợp lệ" }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: "Cần nhập lý do dời lịch" }, { status: 400 });
  }
  const item = rescheduleItem(ctx.params.id, start, len, reason, s.email);
  return NextResponse.json({ item });
});
