import { auth } from "@/auth"

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin")
  const isPos = req.nextUrl.pathname.startsWith("/pos")

  if (isAdmin || isPos) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      return Response.redirect(loginUrl)
    }
    // CASHIER can only access POS, not admin
    const role = (req.auth.user as { role?: string })?.role
    if (isAdmin && role === "CASHIER") {
      return Response.redirect(new URL("/pos", req.nextUrl.origin))
    }
  }

  return undefined
})

export const config = {
  matcher: ["/admin/:path*", "/pos/:path*"],
}
