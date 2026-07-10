import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Roadmap from "@/components/Roadmap";

export const dynamic = "force-dynamic";

export default function Home() {
  const s = getSession();
  if (!s) redirect("/login");
  return <Roadmap role={s.role} email={s.email} />;
}
