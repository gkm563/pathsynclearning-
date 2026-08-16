"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Globe, Sun, Moon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { apiGet, apiSend } from "@/lib/api";
import type { NavLink } from "@/types";
import { routes } from "@/lib/routes";

export default function Header() {
  const links: NavLink[] = [
    { label: "Home", path: routes.home },
    { label: "Platform", path: routes.marketing.platform },
    { label: "Methodology", path: routes.marketing.methodology },
    { label: "Mission", path: routes.marketing.mission },
    { label: "Company", path: routes.marketing.company },
    { label: "Blog", path: routes.marketing.blog },
    { label: "Community", path: routes.marketing.community },
  ];

  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSignedIn) return;
      try {
        const data = await apiGet<{ settings?: { theme?: string } }>("/api/me/settings");
        if (cancelled) return;
        const theme = data.settings?.theme === "dark";
        setIsDark(theme);
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

  const isAuthenticated = Boolean(isSignedIn);

  return (
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-[100] flex justify-center">
      <header className="pointer-events-auto flex w-[calc(100%-64px)] max-w-[1280px] items-center justify-between rounded-3xl border border-white bg-[var(--overlay-bg)] px-6 py-2 pr-3 shadow-[0_12px_40px_rgba(108,99,255,0.08),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-3xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-linear-to-br from-[#6c63ff] to-[#00c9a7] font-display text-lg font-extrabold text-[var(--text-inverse)] shadow-[0_4px_14px_rgba(108,99,255,0.25)]">
              P
            </div>
            <span className="font-display text-[22px] font-extrabold text-[var(--text-main)]">
              Path<span className="text-[#6c63ff]">Ed</span>
            </span>
            <div className="ml-1.5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-alt)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#6c63ff]">
              BETA
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="rounded-xl px-3.5 py-2 font-sans text-[13.5px] font-semibold text-[var(--text-main)] no-underline transition-colors hover:bg-[var(--bg-alt)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-alt)]"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-alt)]"
            aria-label="Language"
          >
            <Globe size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-alt)]"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="ml-2 flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={routes.auth.continue}
                    className="inline-block rounded-[14px] bg-linear-to-br from-[#6c63ff] to-[#00c9a7] px-[22px] py-2.5 font-display text-sm font-bold text-white no-underline shadow-[0_6px_20px_rgba(108,99,255,0.25)]"
                  >
                    Dashboard →
                  </Link>
                </motion.div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut({ redirectUrl: "/" });
                  }}
                  className="cursor-pointer rounded-[10px] border-none bg-transparent px-3 py-2 font-sans text-[13px] font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-alt)]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={routes.auth.signIn}
                  className="inline-block rounded-xl px-4 py-2.5 font-display text-sm font-bold text-[#6c63ff] no-underline transition-all hover:bg-[var(--bg-alt)]"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={routes.auth.signUp}
                    className="inline-block rounded-[14px] bg-[var(--bg-inverse)] px-6 py-3 font-display text-sm font-bold text-[var(--text-inverse)] no-underline shadow-[0_6px_16px_rgba(26,26,46,0.15)]"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
