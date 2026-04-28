import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_SECRET_BYTES } from "@/lib/secret";

const SECRET = SESSION_SECRET_BYTES;

const PUBLIC_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("savepoint-session")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isAuthenticated = true;
    } catch {
      // Invalid or expired token
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Authenticated user trying to access auth pages → redirect to library
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/library", request.url));
  }

  // Unauthenticated user trying to access protected pages → redirect to login
  if (!isAuthenticated && !isPublicRoute && pathname !== "/") {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
