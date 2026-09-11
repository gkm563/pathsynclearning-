import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import HashScroll from "@/components/layout/HashScroll";
import { ToastProvider } from "@/components/ui";
import { routes } from "@/lib/routes";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

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
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
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
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${sans.className} app-container`} suppressHydrationWarning>
        <ClerkProvider
          signInUrl={routes.auth.signIn}
          signUpUrl={routes.auth.signUp}
          signInFallbackRedirectUrl={routes.auth.continue}
          signUpFallbackRedirectUrl={routes.auth.continue}
          signInForceRedirectUrl={routes.auth.continue}
          signUpForceRedirectUrl={routes.auth.continue}
          appearance={{
            variables: {
              fontFamily: "var(--font-sans), sans-serif",
              fontFamilyButtons: "var(--font-sans), sans-serif",
              colorPrimary: "#1b4540",
              borderRadius: "12px",
            },
          }}
        >
          <HashScroll />
          {/* Single toast host for the whole app — see useToast(). */}
          <ToastProvider>{children}</ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
