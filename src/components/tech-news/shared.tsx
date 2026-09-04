"use client";

import type { CSSProperties, ReactNode } from "react";

export const newsCardStyle: CSSProperties = {
  background: "var(--bg-card)",
  border: "1.5px solid var(--border-light)",
  borderRadius: 16,
  overflow: "hidden",
};

export function NewsSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="news-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 16,
      }}
      aria-busy="true"
      aria-label="Loading news"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...newsCardStyle, padding: 0 }}>
          <div
            style={{
              height: 140,
              background:
                "linear-gradient(90deg, var(--border-light) 25%, var(--bg-alt) 50%, var(--border-light) 75%)",
              backgroundSize: "200% 100%",
              animation: "newsShimmer 1.2s ease-in-out infinite",
            }}
          />
          <div style={{ padding: 16 }}>
            <div
              style={{
                height: 14,
                width: "40%",
                borderRadius: 8,
                background: "var(--border-light)",
                marginBottom: 10,
              }}
            />
            <div
              style={{
                height: 18,
                width: "90%",
                borderRadius: 8,
                background: "var(--border-light)",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 14,
                width: "70%",
                borderRadius: 8,
                background: "var(--border-light)",
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes newsShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 960px) {
          .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .news-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .news-grid * { animation: none !important; }
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
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: 18,
            fontWeight: 800,
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
