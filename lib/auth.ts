import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ADMIN_COOKIE_NAME } from "./constants";

export { ADMIN_COOKIE_NAME };
const SESSION_COOKIE = ADMIN_COOKIE_NAME;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function verifyPassword(plainPassword: string): Promise<boolean> {
  const hashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
  if (!hashB64) throw new Error("ADMIN_PASSWORD_HASH_B64 is not set");
  const hash = Buffer.from(hashB64, "base64").toString("utf8");
  return bcrypt.compare(plainPassword, hash);
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `admin.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isSessionValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresAtStr, signature] = parts;
  const payload = `${role}.${expiresAtStr}`;
  const expected = sign(payload);
  if (signature !== expected) return false;
  const expiresAt = Number(expiresAtStr);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
  return role === "admin";
}

export function isAdminRequest(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return isSessionValid(token);
}
