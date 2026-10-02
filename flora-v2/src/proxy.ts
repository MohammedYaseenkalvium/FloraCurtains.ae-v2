import { auth } from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/enquiries",
  "/customers",
  "/quotations",
  "/projects",
  "/payments",
  "/tasks",
  "/site-visits",
  "/measurements",
  "/inventory",
  "/staff",
  "/settings",
];

/**
 * Defense-in-depth auth gate. CRM layouts already check auth(),
 * this middleware redirects unauthenticated CRM navigations early.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (needsAuth && !req.auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }
  return undefined;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/enquiries/:path*",
    "/customers/:path*",
    "/quotations/:path*",
    "/projects/:path*",
    "/payments/:path*",
    "/tasks/:path*",
    "/site-visits/:path*",
    "/measurements/:path*",
    "/inventory/:path*",
    "/staff/:path*",
    "/settings/:path*",
  ],
};
