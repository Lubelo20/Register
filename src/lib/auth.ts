import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
export const SESSION_COOKIE = "admin_session";

/** Stateless session token derived from the admin password + secret. */
export function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  return crypto.createHmac("sha256", SECRET).update(pw).digest("hex");
}

export function isValidSession(token?: string): boolean {
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
