"use client";

import { useState } from "react";
import { apiSend } from "@/lib/api";
import type { MemorySettingsDto } from "@/lib/memory/types";
import { Button, Dialog, Switch } from "@/components/ui";

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
  { key: "allowAiNotes", label: "Allow Copilot to use notes" },
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
    <Dialog
      open
      onClose={onClose}
      title="Memory Settings"
      description="Choose what appears on your Memory Lane. Progress analytics stay on the Progress tab."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {FIELDS.map((f) => (
          <Switch
            key={f.key}
            checked={Boolean(settings[f.key])}
            onChange={(next) => setSettings((s) => ({ ...s, [f.key]: next }))}
            label={f.label}
          />
        ))}
      </div>
    </Dialog>
  );
}
