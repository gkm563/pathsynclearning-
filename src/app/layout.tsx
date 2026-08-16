import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import HashScroll from "@/components/layout/HashScroll";
import { routes } from "@/lib/routes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "PathEd",
    template: "%s · PathEd",
  },
  description:
    "Career readiness platform bridging academic theory and industry demands.",
  icons: {
    icon: "/favicon.svg",
  },
};

/**
 * Relative Clerk URLs (from routes + env) keep auth on this app.
 * Do not point sign-in/up at Account Portal (*.accounts.dev).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-container" suppressHydrationWarning>
        <ClerkProvider
          signInUrl={routes.auth.signIn}
          signUpUrl={routes.auth.signUp}
          signInFallbackRedirectUrl={routes.auth.continue}
          signUpFallbackRedirectUrl={routes.auth.continue}
          signInForceRedirectUrl={routes.auth.continue}
          signUpForceRedirectUrl={routes.auth.continue}
        >
          <HashScroll />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
