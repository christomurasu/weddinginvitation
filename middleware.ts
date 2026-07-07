import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith("/weddings")
  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get("admin_session")?.value
  if (session === process.env.ADMIN_SECRET) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/weddings/:path*"]
}