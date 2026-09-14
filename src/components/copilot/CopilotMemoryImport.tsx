"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  COPILOT_MEMORY_MAX,
  COPILOT_MEMORY_SOURCES,
  copilotMemoryHandoffPrompt,
  type CopilotMemorySource,
} from "@/lib/ai/copilot-identity";
import { Button, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard unavailable");
}

export function CopilotMemoryImport({
  source,
  memory,
  companionName,
  studentFirstName,
  disabled,
  onSource,
  onMemory,
}: {
  source: CopilotMemorySource | null;
  memory: string;
  companionName: string;
  studentFirstName?: string;
  disabled?: boolean;
  onSource: (next: CopilotMemorySource | null) => void;
  onMemory: (next: string) => void;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const prompt = copilotMemoryHandoffPrompt({
    source,
    companionName,
    studentFirstName,
  });
  const selected = source
    ? COPILOT_MEMORY_SOURCES.find((item) => item.id === source)
    : null;
  const product = selected?.label ?? "ChatGPT, Claude, or Gemini";

  const onCopy = async (openChat = false) => {
    try {
      await copyText(prompt);
      setCopied(true);
      toast.success(
        openChat && selected
          ? `Prompt copied — opening ${selected.label}`
          : "Prompt copied — paste it in your other AI",
      );
      if (openChat && selected) {
        window.open(selected.href, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn’t copy. Select the prompt and copy it yourself.");
    }
  };

  return (
    <div>
      <p className="type-label mb-2.5 block text-ink">Bring memory from another AI</p>
      <p className="type-caption mt-0 mb-3 text-muted">
        Copy the prompt into {product}. Paste that AI’s full reply here so {companionName} gets who you are, how you learn, and open chat threads. We never log into those products.
      </p>

      <ol className="type-caption m-0 mb-4 list-decimal space-y-1.5 pl-5 text-muted">
        <li>Pick where you already chat.</li>
        <li>Copy the prompt and send it there.</li>
        <li>Paste the full reply below.</li>
      </ol>

      <div className="mb-3 flex flex-wrap gap-2">
        {COPILOT_MEMORY_SOURCES.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSource(source === item.id ? null : item.id)}
            aria-pressed={source === item.id}
            className={cn(
              "type-label rounded-full border px-3 py-1.5",
              source === item.id
                ? "border-primary bg-primary text-[var(--text-on-primary)]"
                : "border-line bg-sunken text-ink",
              disabled && "cursor-not-allowed opacity-70",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-[var(--radius-md)] border border-line bg-sunken p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="type-caption m-0 font-semibold text-ink">Prompt to paste there</p>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => void onCopy(false)}
            >
              {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              {copied ? "Copied" : "Copy prompt"}
            </Button>
            {selected ? (
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => void onCopy(true)}
              >
                <ExternalLink size={14} aria-hidden />
                Open {selected.label}
              </Button>
            ) : null}
          </div>
        </div>
        <pre className="type-caption m-0 max-h-40 overflow-auto whitespace-pre-wrap text-muted">
          {prompt}
        </pre>
      </div>

      <Textarea
        rows={6}
        maxLength={COPILOT_MEMORY_MAX}
        disabled={disabled}
        value={memory}
        placeholder={`Paste ${product}’s full reply here…`}
        onChange={(e) => onMemory(e.target.value)}
      />
      <p className="type-caption mt-2 mb-0 text-faint">
        {memory.length}/{COPILOT_MEMORY_MAX}
      </p>
    </div>
  );
}
