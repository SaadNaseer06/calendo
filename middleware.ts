import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/calendar/:path*",
    "/ai-studio/:path*",
    "/brands/:path*",
    "/api/brands/:path*",
    "/api/posts/:path*",
    "/api/ai/:path*",
    "/api/analytics",
    "/api/analytics/:path*",
    "/api/export/:path*",
    "/api/share",
  ],
};
