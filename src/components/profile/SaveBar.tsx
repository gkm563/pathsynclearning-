"use client";

import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { PROFILE_COLS } from "./shared";

export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (!dirty && !saving) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      style={{
        position: "sticky",
        bottom: 16,
        zIndex: 40,
        marginTop: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: "14px 18px",
        borderRadius: 16,
        border: "1.5px solid rgba(108,99,255,0.35)",
        background: "color-mix(in srgb, var(--bg-card) 92%, #6c63ff)",
        boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--text-main)",
          }}
        >
          Unsaved changes
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
          Save to sync your profile and preferences.
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button variant="secondary" disabled={saving} onClick={onDiscard}>
          <RotateCcw size={15} /> Discard
        </Button>
        <Button
          disabled={!dirty || saving}
          onClick={onSave}
          style={{
            opacity: !dirty || saving ? 0.65 : 1,
            background: `linear-gradient(135deg, ${PROFILE_COLS.primary}, ${PROFILE_COLS.success})`,
          }}
        >
          {saving ? <Loader2 size={15} /> : <Save size={15} />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
