import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  AUTH_PAGE_MATCHERS,
  PROTECTED_ROUTE_MATCHERS,
  authContinueWithRole,
  isMarketingPlatformPath,
  routes,
} from "@/lib/routes";

const isAuthPage = createRouteMatcher([...AUTH_PAGE_MATCHERS]);
const isProtectedRoute = createRouteMatcher([...PROTECTED_ROUTE_MATCHERS]);

/**
 * Public-first middleware.
 * signInUrl/signUpUrl are relative app paths so Clerk never falls back to
 * the hosted Account Portal (*.accounts.dev).
 */
export default clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;

    if (userId && isAuthPage(req)) {
      const role = req.nextUrl.searchParams.get("role");
      return NextResponse.redirect(
        new URL(authContinueWithRole(role), req.url),
      );
    }

    if (isMarketingPlatformPath(pathname)) {
      return NextResponse.next();
    }

    if (isProtectedRoute(req)) {
      // Same-origin /sign-in — derived from the current request, not a hardcoded host
      await auth.protect({
        unauthenticatedUrl: new URL(routes.auth.signIn, req.url).toString(),
      });
    }
  },
  {
    signInUrl: routes.auth.signIn,
    signUpUrl: routes.auth.signUp,
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
