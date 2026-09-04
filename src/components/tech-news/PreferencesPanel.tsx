"use client";

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
        background: "rgba(0,0,0,0.45)",
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
          border: "1.5px solid var(--border-light)",
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "Outfit, sans-serif",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Preferred categories
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 13 }}>
          We’ll prioritize these topics in your category strip. Feed still shows all news.
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
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  border: on ? "none" : "1.5px solid var(--border-light)",
                  background: on ? "#6c63ff" : "var(--bg-alt)",
                  color: on ? "#fff" : "var(--text-main)",
                  fontFamily: "Outfit, sans-serif",
                }}
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
