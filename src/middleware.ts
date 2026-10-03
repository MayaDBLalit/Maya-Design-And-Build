import { NextRequest, NextResponse } from "next/server";
import { verifyAdminJWT, AUTH_COOKIE_NAME } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminJWT(token) : null;

    // If authenticated user visits login page, redirect to dashboard
    if (isLoginPage && session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // If unauthenticated user visits protected admin page, redirect to login
    if (!isLoginPage && !session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
