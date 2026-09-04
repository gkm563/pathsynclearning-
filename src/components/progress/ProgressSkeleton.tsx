"use client";

import { SkeletonBlock, cardStyle } from "@/components/progress/shared";

export function ProgressSkeleton() {
  return (
    <div
      style={{ display: "grid", gap: 16 }}
      aria-busy="true"
      aria-label="Loading progress"
    >
      <div>
        <SkeletonBlock height={34} width="40%" style={{ marginBottom: 10 }} />
        <SkeletonBlock height={16} width="55%" />
      </div>

      <div style={{ ...cardStyle }}>
        <SkeletonBlock height={18} width="30%" style={{ marginBottom: 16 }} />
        <SkeletonBlock height={24} width="100%" radius={12} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
        className="progress-stats-grid"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ ...cardStyle, padding: 18 }}>
            <SkeletonBlock height={36} width={36} radius={12} style={{ marginBottom: 12 }} />
            <SkeletonBlock height={26} width="50%" style={{ marginBottom: 8 }} />
            <SkeletonBlock height={14} width="70%" />
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle }}>
        <SkeletonBlock height={18} width="35%" style={{ marginBottom: 16 }} />
        <SkeletonBlock height={88} width="100%" radius={14} style={{ marginBottom: 12 }} />
        <SkeletonBlock height={88} width="100%" radius={14} />
      </div>

      <style>{`
        @keyframes progressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 900px) {
          .progress-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
