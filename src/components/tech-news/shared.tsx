"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isGeneratedSocialCard, nonemptyUrl } from "@/lib/news/normalize";

export function NewsCover({
  src,
  alt = "",
  tint,
}: {
  src: string | null;
  alt?: string;
  tint?: string;
}) {
  const [failed, setFailed] = useState(false);
  const photo = nonemptyUrl(src);
  const showPhoto = Boolean(photo) && !isGeneratedSocialCard(photo) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className="news-cover"
      style={
        tint
          ? {
              background: `linear-gradient(135deg, ${tint}22, var(--bg-alt))`,
            }
          : undefined
      }
    >
      {showPhoto ? (
        <img
          src={photo ?? undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="news-cover-fallback" aria-hidden>
          <img src="/favicon.svg" alt="" />
          <span>PathEd</span>
        </div>
      )}
    </div>
  );
}

export function NewsFeedBusy({ label = "Updating stories…" }: { label?: string }) {
  return (
    <div className="news-feed-overlay">
      <div className="news-feed-status" role="status" aria-live="polite">
        <span className="news-spin" aria-hidden />
        {label}
      </div>
    </div>
  );
}

export function NewsSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="tech-news-grid" aria-busy="true" aria-label="Loading news">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="news-card"
          style={{ pointerEvents: "none", boxShadow: "none" }}
        >
          <div
            className="news-cover"
            style={{
              background:
                "linear-gradient(90deg, var(--border-light) 25%, var(--bg-alt) 50%, var(--border-light) 75%)",
              backgroundSize: "200% 100%",
              animation: "newsShimmer 1.2s ease-in-out infinite",
            }}
          />
          <div className="news-card-body">
            <div className="news-skel-line" style={{ height: 10, width: "28%" }} />
            <div
              className="news-skel-line"
              style={{ height: 16, width: "92%", marginTop: 12 }}
            />
            <div
              className="news-skel-line"
              style={{ height: 16, width: "74%", marginTop: 8 }}
            />
            <div
              className="news-skel-line"
              style={{ height: 12, width: "100%", marginTop: 14 }}
            />
            <div
              className="news-skel-line"
              style={{ height: 12, width: "64%", marginTop: 8 }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes newsShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tech-news-grid .news-cover { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

export function NewsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-main)",
          }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function formatNewsTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const CATEGORY_COLOR: Record<string, string> = {
  AI: "#6c63ff",
  Programming: "#00c9a7",
  Startups: "#38bdf8",
  Cybersecurity: "#ec4899",
  "Web Development": "#8b5cf6",
  Cloud: "#f59e0b",
  "Open Source": "#10b981",
  Gadgets: "#64748b",
};
