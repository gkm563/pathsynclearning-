"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { NEWS_CATEGORIES } from "@/lib/news/constants";
import { Button } from "@/components/ui/primitives";

export function PreferencesPanel({
  open,
  selected,
  onClose,
  onChange,
  onSave,
  saving,
}: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onChange: (categories: string[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="News category preferences"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(15, 23, 42, 0.4)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(480px, 100%)",
          background: "var(--bg-card)",
          borderRadius: 18,
          border: "1px solid var(--border-light)",
          padding: 22,
          boxShadow: "0 18px 48px rgba(26, 26, 46, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 750,
              letterSpacing: "-0.03em",
            }}
          >
            Preferred categories
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            style={{
              width: 40,
              height: 40,
              border: "none",
              borderRadius: 10,
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>
          We’ll prioritize these topics in your category strip. The feed still shows all news.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {NEWS_CATEGORIES.map((cat) => {
            const on = selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(cat)}
                className={`news-chip${on ? " is-active" : ""}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
