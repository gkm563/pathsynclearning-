"use client";

import {
  type PreferencesFormState,
  type ProfileVisibility,
  type ThemePreference,
} from "@/lib/profile/types";
import {
  PROFILE_COLS,
  SectionHeading,
  ToggleRow,
  sectionCard,
} from "./shared";

export function PreferencesSection({
  draft,
  disabled,
  onChange,
}: {
  draft: PreferencesFormState;
  disabled?: boolean;
  onChange: <K extends keyof PreferencesFormState>(
    key: K,
    value: PreferencesFormState[K],
  ) => void;
}) {
  return (
    <section id="preferences" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={sectionCard}>
        <SectionHeading
          title="Appearance"
          description={
            disabled
              ? "Click Edit Profile to change your theme."
              : "Theme applies across the PathEd portal."
          }
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            opacity: disabled ? 0.75 : 1,
          }}
        >
          {(
            [
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
            ] as { id: ThemePreference; label: string }[]
          ).map((opt) => {
            const active = draft.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange("theme", opt.id)}
                aria-pressed={active}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 16,
                  border: active
                    ? `2px solid ${PROFILE_COLS.primary}`
                    : "1.5px solid var(--border-light)",
                  background: opt.id === "dark" ? "#151b2b" : "var(--bg-alt)",
                  color: opt.id === "dark" ? "#e2e8f0" : "var(--text-main)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 750,
                  fontSize: 14,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={sectionCard}>
        <SectionHeading
          title="Notifications"
          description="Control how PathEd reaches you."
        />
        <ToggleRow
          id="emailNotifications"
          label="Email notifications"
          description="Streak reminders, assessment results, and account alerts."
          checked={draft.emailNotifications}
          disabled={disabled}
          onChange={(v) => onChange("emailNotifications", v)}
        />
        <ToggleRow
          id="pushNotifications"
          label="Push notifications"
          description="Realtime alerts when you’re in the app."
          checked={draft.pushNotifications}
          disabled={disabled}
          onChange={(v) => onChange("pushNotifications", v)}
        />
        <ToggleRow
          id="productUpdates"
          label="Product & news updates"
          description="Occasional product announcements and curated tech news."
          checked={draft.productUpdates}
          disabled={disabled}
          onChange={(v) => onChange("productUpdates", v)}
        />
      </div>

      <div style={sectionCard}>
        <SectionHeading
          title="Privacy"
          description="Controls who can look up your profile by username."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            opacity: disabled ? 0.75 : 1,
          }}
        >
          {(
            [
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
            ] as { id: ProfileVisibility; label: string; desc: string }[]
          ).map((opt) => {
            const active = draft.profileVisibility === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange("profileVisibility", opt.id)}
                aria-pressed={active}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 14,
                  border: active
                    ? `2px solid ${PROFILE_COLS.primary}`
                    : "1.5px solid var(--border-light)",
                  background: active ? "rgba(108,99,255,0.06)" : "var(--bg-alt)",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 750,
                    fontSize: 14,
                    color: "var(--text-main)",
                  }}
                >
                  {opt.label}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
