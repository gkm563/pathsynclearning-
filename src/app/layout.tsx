import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import HashScroll from "@/components/layout/HashScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathEd",
  description:
    "Career readiness platform bridging academic theory and industry demands.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-container" suppressHydrationWarning>
        <ClerkProvider>
          <HashScroll />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}