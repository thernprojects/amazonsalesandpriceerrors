import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

// Note: this is a fast, edge-safe pre-check only (cookie shape + expiry).
// It deliberately skips HMAC verification because Node's `crypto` isn't
// available on the Edge runtime that middleware runs on. The real,
// cryptographically-verified check (isAdminRequest in lib/auth.ts) runs
// again inside the actual admin pages/route handlers on the Node runtime,
// so a forged cookie that merely has the right shape still gets rejected
// before any admin data is returned.
function looksLikeUnexpiredAdminCookie(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresAtStr] = parts;
  if (role !== "admin") return false;
  const expiresAt = Number(expiresAtStr);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page itself load for everyone.
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!looksLikeUnexpiredAdminCookie(token)) {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
