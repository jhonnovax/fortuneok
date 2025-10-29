import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If user is signed in and visiting "/", redirect to /dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin ));
  }

  // If not signed in and trying to access protected route, redirect to /login
  /* if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl.origin ));
  } */

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"], // define which routes this applies to
};
