import { NextResponse } from "next/server";
import { withAdmin } from "../_guard";
import { publish } from "@/lib/repo";

export const POST = withAdmin(async (s) => {
  const at = publish(s.email);
  return NextResponse.json({ published_at: at });
});
