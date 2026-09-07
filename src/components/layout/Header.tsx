"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { apiGet, apiSend } from "@/lib/api";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button, IconButton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/types";
import { routes } from "@/lib/routes";

const LINKS: NavLink[] = [
  { label: "Platform", path: routes.marketing.platform },
  { label: "Methodology", path: routes.marketing.methodology },
  { label: "Mission", path: routes.marketing.mission },
  { label: "Pricing", path: routes.marketing.pricing },
  { label: "Company", path: routes.marketing.company },
  { label: "Blog", path: routes.marketing.blog },
  { label: "Community", path: routes.marketing.community },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSignedIn) return;
      try {
        const data = await apiGet<{ settings?: { theme?: string } }>(
          "/api/me/settings",
        );
        if (cancelled) return;
        setIsDark(data.settings?.theme === "dark");
      } catch {
        // keep light default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    const themeVal = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeVal);
    document.body.setAttribute("data-theme", themeVal);
    if (isSignedIn) {
      apiSend("/api/me/settings", "PUT", { theme: themeVal }).catch(() => {});
    }
  }, [isDark, isSignedIn]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isAuthenticated = Boolean(isSignedIn);

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-line bg-[var(--overlay-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[var(--measure-content)] items-center justify-between gap-4 px-4 sm:px-6">
        <BrandMark href={routes.home} size="sm" />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.path || pathname?.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "type-label rounded-[var(--radius-sm)] px-3 py-2 no-underline transition-colors duration-[var(--duration-fast)]",
                  active
                    ? "bg-sunken text-ink"
                    : "text-muted hover:bg-sunken hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <IconButton
            label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setIsDark((v) => !v)}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>

          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => void signOut({ redirectUrl: "/" })}
                  className="type-label rounded-[var(--radius-sm)] px-3 py-2 text-muted transition-colors duration-[var(--duration-fast)] hover:bg-sunken hover:text-ink"
                >
                  Sign out
                </button>
                <Link
                  href={routes.auth.continue}
                  className="type-label inline-flex h-9 items-center rounded-[var(--radius-md)] bg-primary px-4 text-on-primary no-underline hover:bg-primary-hover"
                >
                  Open dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={routes.auth.signIn}
                  className="type-label rounded-[var(--radius-sm)] px-3 py-2 text-muted no-underline transition-colors duration-[var(--duration-fast)] hover:bg-sunken hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  href={routes.auth.signUp}
                  className="type-label inline-flex h-9 items-center rounded-[var(--radius-md)] bg-primary px-4 text-on-primary no-underline hover:bg-primary-hover"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <IconButton
            className="border border-line lg:hidden"
            label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </IconButton>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-surface px-4 py-4 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="type-label rounded-[var(--radius-sm)] px-3 py-3 text-ink no-underline hover:bg-sunken"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={routes.auth.continue}
                  className="type-label inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-on-primary no-underline"
                >
                  Open dashboard
                </Link>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => void signOut({ redirectUrl: "/" })}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={routes.auth.signUp}
                  className="type-label inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-on-primary no-underline"
                >
                  Get started
                </Link>
                <Link href={routes.auth.signIn}>
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
