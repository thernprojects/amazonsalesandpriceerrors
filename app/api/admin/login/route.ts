import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const isValid = await verifyPassword(password);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
