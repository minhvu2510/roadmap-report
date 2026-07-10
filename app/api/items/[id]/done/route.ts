import { NextResponse } from "next/server";
import { withAdmin } from "../../../_guard";
import { markDone } from "@/lib/repo";

export const POST = withAdmin(async (s, _req, ctx) => {
  const item = markDone(ctx.params.id, s.email);
  return NextResponse.json({ item });
});
