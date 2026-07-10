import { NextResponse } from "next/server";
import { withAdmin } from "../../_guard";
import { updateItem, deleteItem } from "@/lib/repo";

export const PUT = withAdmin(async (s, req, ctx) => {
  const body = await req.json();
  const item = updateItem(ctx.params.id, body, s.email);
  return NextResponse.json({ item });
});

export const DELETE = withAdmin(async (s, _req, ctx) => {
  deleteItem(ctx.params.id, s.email);
  return NextResponse.json({ ok: true });
});
