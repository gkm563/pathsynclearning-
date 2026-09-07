"use client";

import { passwordStrength } from "@/lib/profile/types";
import { Progress } from "@/components/ui";

const MAX_SCORE = 5;

/**
 * The rating is exposed as text (and announced politely), not just as a bar
 * colour — colour alone tells a screen-reader or colour-blind user nothing.
 */
const TONE: Record<string, "danger" | "warning" | "success"> = {
  Weak: "danger",
  Fair: "warning",
  Strong: "success",
  Excellent: "success",
};

const TEXT: Record<string, string> = {
  Weak: "text-danger",
  Fair: "text-warning",
  Strong: "text-success",
  Excellent: "text-success",
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="type-small text-muted">Password strength</span>
        <span
          aria-live="polite"
          className={`type-label ${TEXT[strength.label] ?? "text-muted"}`}
        >
          {strength.label}
        </span>
      </div>
      <Progress
        value={strength.score}
        max={MAX_SCORE}
        tone={TONE[strength.label] ?? "primary"}
        size="sm"
        label={`Password strength: ${strength.label}`}
      />
      <p className="type-caption mt-2 mb-0 text-muted">
        Use at least 8 characters with upper case, lower case and a number. Length
        and a symbol push it further.
      </p>
    </div>
  );
}
