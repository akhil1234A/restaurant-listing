import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === "/login" || path === "/register"
  const hasAccessToken = request.cookies.has("accessToken")

  // Redirect authenticated users from login/register to home
  if (isPublicPath && hasAccessToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (
    !hasAccessToken &&
    (path.startsWith("/add-restaurant") ||
     path.startsWith("/edit-restaurant") ||
     path.startsWith("/restaurants"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/add-restaurant/:path*",
    "/edit-restaurant/:path*",
    "/restaurants/:path*",
  ],
}