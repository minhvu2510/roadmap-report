import { NextResponse } from "next/server";
import { withAdmin } from "../../../_guard";
import { itemHistory } from "@/lib/repo";

export const GET = withAdmin(async (_s, _req, ctx) => {
  return NextResponse.json({ history: itemHistory(ctx.params.id) });
});
