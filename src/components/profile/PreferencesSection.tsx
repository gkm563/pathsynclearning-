"use client";

import { Pencil } from "lucide-react";
import {
  type PreferencesFormState,
  type ProfileVisibility,
  type ThemePreference,
} from "@/lib/profile/types";
import { Alert, Button, Card, Switch } from "@/components/ui";
import { cn } from "@/lib/cn";

const THEMES: { id: ThemePreference; label: string; hint: string }[] = [
  { id: "light", label: "Light", hint: "Paper surfaces, dark ink" },
  { id: "dark", label: "Dark", hint: "Low-glare evening reading" },
];

const VISIBILITY: {
  id: ProfileVisibility;
  label: string;
  desc: string;
}[] = [
  {
    id: "public",
    label: "Public",
    desc: "Anyone signed in can view your profile",
  },
  {
    id: "connections",
    label: "Connections",
    desc: "Only you for now — connections coming soon",
  },
  {
    id: "private",
    label: "Private",
    desc: "Hidden from username lookup",
  },
];

export function PreferencesSection({
  draft,
  disabled,
  onChange,
  onRequestEdit,
}: {
  draft: PreferencesFormState;
  disabled?: boolean;
  onChange: <K extends keyof PreferencesFormState>(
    key: K,
    value: PreferencesFormState[K],
  ) => void;
  onRequestEdit?: () => void;
}) {
  return (
    <section id="preferences" className="flex flex-col gap-4">
      {disabled && onRequestEdit ? (
        <Alert tone="info" title="Preferences are locked">
          <div className="flex flex-wrap items-center gap-3">
            <span>Switch to editing to change theme, notifications or visibility.</span>
            <Button size="sm" className="min-h-11" onClick={onRequestEdit}>
              <Pencil size={14} aria-hidden />
              Edit profile
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card>
        <h3 className="type-h4 m-0 text-ink">Appearance</h3>
        <p className="type-small mt-1 mb-4 text-muted">
          Theme applies across the PathEd portal the moment you pick it.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {THEMES.map((opt) => {
            const active = draft.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange("theme", opt.id)}
                aria-pressed={active}
                className={cn(
                  "min-h-16 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary-soft text-ink"
                    : "border-line bg-sunken text-ink hover:border-line-strong",
                  disabled && "cursor-not-allowed opacity-70",
                )}
              >
                <span className="type-label block">{opt.label}</span>
                <span className="type-caption mt-1 block text-muted">
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="type-h4 m-0 text-ink">Notifications</h3>
        <p className="type-small mt-1 mb-4 text-muted">
          Control how PathEd reaches you.
        </p>
        <div className="flex flex-col divide-y divide-line">
          <Switch
            label="Email notifications"
            description="Streak reminders, assessment results, and account alerts."
            checked={draft.emailNotifications}
            disabled={disabled}
            onChange={(v) => onChange("emailNotifications", v)}
            className="py-3 first:pt-0"
          />
          <Switch
            label="Push notifications"
            description="Realtime alerts when you’re in the app."
            checked={draft.pushNotifications}
            disabled={disabled}
            onChange={(v) => onChange("pushNotifications", v)}
            className="py-3"
          />
          <Switch
            label="Product & news updates"
            description="Occasional product announcements and curated tech news."
            checked={draft.productUpdates}
            disabled={disabled}
            onChange={(v) => onChange("productUpdates", v)}
            className="py-3 last:pb-0"
          />
        </div>
      </Card>

      <Card>
        <h3 className="type-h4 m-0 text-ink">Privacy</h3>
        <p className="type-small mt-1 mb-4 text-muted">
          Controls who can look up your profile by username.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {VISIBILITY.map((opt) => {
            const active = draft.profileVisibility === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange("profileVisibility", opt.id)}
                aria-pressed={active}
                className={cn(
                  "min-h-20 rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary-soft"
                    : "border-line bg-sunken hover:border-line-strong",
                  disabled && "cursor-not-allowed opacity-70",
                )}
              >
                <span className="type-label block text-ink">{opt.label}</span>
                <span className="type-caption mt-1 block text-muted">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
