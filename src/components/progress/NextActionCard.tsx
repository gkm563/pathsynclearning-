"use client";

import { ArrowRight, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProgressNextAction } from "@/lib/progress/types";
import { Button } from "@/components/ui/primitives";
import { cardStyle, PROGRESS_COLS } from "@/components/progress/shared";
import { routes } from "@/lib/routes";

export function NextActionCard({ action }: { action: ProgressNextAction }) {
  const router = useRouter();
  const caughtUp = action.kind === "caught_up";

  return (
    <aside
      style={{
        ...cardStyle,
        background: caughtUp
          ? "linear-gradient(135deg, rgba(0,201,167,0.12), rgba(108,99,255,0.08))"
          : "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,201,167,0.08))",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0, flex: "1 1 240px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: PROGRESS_COLS.primary,
            marginBottom: 6,
          }}
        >
          {caughtUp ? "All done" : "Continue where you left off"}
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {caughtUp ? <PartyPopper size={22} /> : null}
          {action.title}
        </h2>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
          {action.subtitle}
        </p>
      </div>

      <Button
        onClick={() =>
          router.push(action.href || routes.app.challenges)
        }
        style={{ minHeight: 44, paddingInline: 18 }}
      >
        {caughtUp ? "Browse Challenges" : "Continue →"}
        {!caughtUp ? <ArrowRight size={16} /> : null}
      </Button>
    </aside>
  );
}
