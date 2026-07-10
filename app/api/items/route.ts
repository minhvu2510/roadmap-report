import { NextResponse } from "next/server";
import { withAdmin } from "../_guard";
import { createItem } from "@/lib/repo";

export const POST = withAdmin(async (s, req) => {
  const body = await req.json();
  const item = createItem(body, s.email);
  return NextResponse.json({ item });
});
