import crypto from "crypto";
import { cookies } from "next/headers";
import { isAdminEmail } from "./constants";
import { READ_ONLY } from "./env";

// NOTE: mock login. Signs a cookie with the email so the SERVER (not just the
// browser) decides admin vs customer. When Google login is wired later, replace
// createSession() input with the verified email from the Google ID token.
const SECRET =
  process.env.SESSION_SECRET || "dev-roadmap-mock-secret-change-me";
export const COOKIE_NAME = "rm_session";

export type Role = "admin" | "customer";
export interface Session {
  email: string;
  role: Role;
}

function sign(payload: string): string {
  const mac = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function makeToken(email: string): string {
  const payload = Buffer.from(email.toLowerCase().trim()).toString("base64url");
  return sign(payload);
}

export function verifyToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  let email: string;
  try {
    email = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!email.includes("@")) return null;
  const role: Role = READ_ONLY ? "customer" : isAdminEmail(email) ? "admin" : "customer";
  return { email, role };
}

// Server-side session read (App Router). Reads the request cookie.
export function getSession(): Session | null {
  const c = cookies().get(COOKIE_NAME);
  return verifyToken(c?.value);
}

export function requireAdmin(): Session {
  const s = getSession();
  if (!s || s.role !== "admin") {
    const err: any = new Error("forbidden");
    err.status = 403;
    throw err;
  }
  return s;
}
