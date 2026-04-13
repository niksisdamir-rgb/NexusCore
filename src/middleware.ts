import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes except login, auth APIs, and verification page
  matcher: [
    "/((?!api/auth|api/sensors/stream|login|verify|_next/static|_next/image|favicon.ico).*)",
  ],
};
