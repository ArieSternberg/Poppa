import { clerkMiddleware } from "@clerk/nextjs/server";

// Export the default middleware
export default clerkMiddleware();

// Configure the middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico).*)",
    "/api/(.*)"
  ],
};