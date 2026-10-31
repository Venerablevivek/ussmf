import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Redirects signed-out visitors away from the athlete dashboard and the review portal.
// This is a convenience, not a security boundary: every page and API route checks the
// user and role again on the server.

const SESSION_COOKIE = "ussmf_session";
const STAFF = ["physician", "admin"];

async function readSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      issuer: "ussmf",
      audience: "ussmf-web",
    });
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && !STAFF.includes(session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
