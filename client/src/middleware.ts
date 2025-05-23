import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register"

  // Check if user is authenticated (has access token)
  const hasAccessToken = request.cookies.has("accessToken")

  // Redirect logic
  if (isPublicPath && hasAccessToken) {
    // If user is authenticated and tries to access login/register, redirect to home
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isPublicPath && !hasAccessToken && (path.startsWith("/add-restaurant") || path.startsWith("/edit-restaurant"))) {
    // If user is not authenticated and tries to access protected routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: ["/login", "/register", "/add-restaurant/:path*", "/edit-restaurant/:path*"],
}
