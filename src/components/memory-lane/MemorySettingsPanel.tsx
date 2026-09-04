"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { apiSend } from "@/lib/api";
import type { MemorySettingsDto } from "@/lib/memory/types";
import { Button } from "@/components/ui/primitives";

const FIELDS: Array<{ key: keyof MemorySettingsDto; label: string }> = [
  { key: "includeLearning", label: "Learning Activity" },
  { key: "includeProjects", label: "Projects" },
  { key: "includeChallenges", label: "Challenges" },
  { key: "includeAchievements", label: "Achievements" },
  { key: "includeCertifications", label: "Certifications" },
  { key: "includeMentorship", label: "Mentorship" },
  { key: "includeEvents", label: "Events" },
  { key: "includeCareer", label: "Career" },
  { key: "includePrivateNotes", label: "Private Notes" },
  { key: "allowAiNotes", label: "Allow AI to use notes (future)" },
];

export function MemorySettingsPanel({
  initial,
  onClose,
  onSaved,
}: {
  initial: MemorySettingsDto;
  onClose: () => void;
  onSaved: (s: MemorySettingsDto) => void;
}) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiSend<{ settings: MemorySettingsDto }>(
        "/api/me/memory-lane",
        "PUT",
        settings,
      );
      onSaved(res.settings);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1350,
        background: "rgba(15,23,42,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          background: "var(--bg-card)",
          borderRadius: 18,
          border: "1.5px solid var(--border-light)",
          padding: 20,
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Memory Settings</h3>
          <button type="button" onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 13 }}>
          Choose what appears on your Memory Lane. Progress analytics stay on the Progress tab.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {FIELDS.map((f) => (
            <label
              key={f.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(settings[f.key])}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [f.key]: e.target.checked }))
                }
              />
              {f.label}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
