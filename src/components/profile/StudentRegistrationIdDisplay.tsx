"use client";

import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { Card, useToast } from "@/components/ui";

type Props = {
  value: string;
  /** Compact chip for headers; default is the full labelled panel. */
  compact?: boolean;
};

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard unavailable");
}

/** Read-only lifetime Student ID. Click the value to copy — no edit control. */
export function StudentRegistrationIdDisplay({ value, compact = false }: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const onCopy = async () => {
    try {
      await copyText(value);
      setCopied(true);
      toast.success("Student ID copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy the Student ID.");
    }
  };

  const idButton = (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label={copied ? "Student ID copied" : "Copy Student ID"}
      title="Click to copy"
      className={
        compact
          ? "cursor-pointer rounded-md border border-line bg-sunken px-2 py-1 font-mono text-[13px] font-semibold tracking-wide text-ink transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          : "mt-2 cursor-pointer rounded-md border border-transparent px-0 py-0.5 text-left font-mono text-[1.05rem] font-semibold tracking-[0.04em] text-ink underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      }
    >
      {value}
    </button>
  );

  if (compact) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="type-caption font-semibold tracking-[0.08em] text-muted uppercase">
          Student ID
        </span>
        {idButton}
      </div>
    );
  }

  return (
    <Card className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-muted">
        <Fingerprint size={16} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="type-caption m-0 font-semibold tracking-[0.1em] text-muted uppercase">
          Student ID
        </p>
        <p className="type-small mt-1 mb-0 text-muted">
          Permanent identity — click the ID to copy. It never changes.
        </p>
        {idButton}
      </div>
    </Card>
  );
}
