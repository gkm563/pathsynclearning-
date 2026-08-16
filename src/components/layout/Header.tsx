"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Globe, Sun, Moon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { storage } from "@/lib/storage";
import type { NavLink } from "@/types";

export default function Header() {
  const links: NavLink[] = [
    { label: "Home", path: "/" },
    { label: "Platform", path: "/platform" },
    { label: "Methodology", path: "/methodology" },
    { label: "Mission", path: "/mission" },
    { label: "Company", path: "/company" },
    { label: "Blog", path: "/blog" },
    { label: "Community", path: "/community" },
  ];

  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);
  const [localAuthed, setLocalAuthed] = useState(false);

  useEffect(() => {
    setIsDark(storage.getItem("theme") === "dark");
    setLocalAuthed(
      storage.getItem("isAuthenticated") === "true" || storage.getItem("userRegistered") === "true",
    );
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      storage.setItem("isAuthenticated", "true");
      storage.setItem("userRegistered", "true");
      const role = sessionStorage.getItem("pathEdRole");
      if (role) storage.setItem("pathEdRole", role);
      setLocalAuthed(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    const checkAuth = () => {
      setLocalAuthed(
        storage.getItem("isAuthenticated") === "true" || storage.getItem("userRegistered") === "true",
      );
    };
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 800);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const themeVal = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeVal);
    document.body.setAttribute("data-theme", themeVal);
    storage.setItem("theme", themeVal);
  }, [isDark]);

  const isAuthenticated = Boolean(isSignedIn) || localAuthed;

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

          <nav className="flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                className="rounded-[10px] px-3 py-2 font-sans text-sm font-medium text-[var(--text-main)] transition-all hover:bg-[var(--bg-alt)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-[var(--text-muted)]">
            <button
              type="button"
              className="flex items-center rounded-lg p-1.5 text-[var(--text-muted)] transition-all hover:bg-[var(--bg-alt)]"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="flex items-center rounded-lg p-1.5 text-[var(--text-muted)] transition-all hover:bg-[var(--bg-alt)]"
            >
              <Globe size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex cursor-pointer items-center rounded-lg border-none bg-transparent p-1.5 transition-all hover:bg-[var(--bg-alt)]"
              style={{ color: isDark ? "#6c63ff" : "#f7971e" }}
            >
              {isDark ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
            </button>
          </div>

          <div className="h-6 w-px bg-[#e0e4f5]" />

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/dashboard"
                    className="inline-block rounded-[14px] bg-linear-to-br from-[#6c63ff] to-[#00c9a7] px-[22px] py-2.5 font-display text-sm font-bold text-white no-underline shadow-[0_6px_20px_rgba(108,99,255,0.25)]"
                  >
                    Dashboard →
                  </Link>
                </motion.div>
                <button
                  type="button"
                  onClick={async () => {
                    storage.removeItem("isAuthenticated");
                    storage.removeItem("userRegistered");
                    setLocalAuthed(false);
                    window.dispatchEvent(new Event("storage"));
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
                  href="/login"
                  className="inline-block rounded-xl px-4 py-2.5 font-display text-sm font-bold text-[#6c63ff] no-underline transition-all hover:bg-[var(--bg-alt)]"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
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
