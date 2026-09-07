"use client";

import { Brain, Check } from "lucide-react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { OnboardingCard, StepHeader } from "./onboarding-ui";

export type FollowUpQuestion = {
  id: string;
  type: "single_choice" | "multi_choice" | "text" | "rating";
  question: string;
  options?: string[];
  reason?: string;
};

export default function AIFollowUpQuestions({
  questions,
  answers,
  onChange,
  mode,
}: {
  questions: FollowUpQuestion[];
  answers: Record<string, unknown>;
  onChange: (answers: Record<string, unknown>) => void;
  mode?: "targeted" | "general" | null;
}) {
  const handleUpdate = (id: string, value: unknown) => {
    onChange({ ...answers, [id]: value });
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Brain size={22} aria-hidden />}
        kicker={mode === "targeted" ? "Company-only questions" : "Role-only questions"}
        title={mode === "targeted" ? "Hiring-loop details" : "Role-path details"}
        subtitle={
          mode === "targeted"
            ? "These are not the same as the role-path questions. We only fill gaps that change this company’s interview plan."
            : "These are not company questions. We only fill gaps that change this role’s curriculum."
        }
      />

      {questions.map((q) => {
        const rawAnswer = answers[q.id];
        const textValue = typeof rawAnswer === "string" ? rawAnswer : "";
        const multiValue = Array.isArray(answers[q.id])
          ? (answers[q.id] as unknown[]).filter((x): x is string => typeof x === "string")
          : [];

        return (
          <div
            key={q.id}
            className="rounded-[var(--radius-md)] border border-line bg-sunken p-5"
          >
            <p className="type-h4 m-0 mb-2 text-ink">{q.question}</p>
            {q.reason ? (
              <p className="type-caption mt-0 mb-4 text-muted">Why we ask: {q.reason}</p>
            ) : null}

            {q.type === "text" && (
              <Input
                value={textValue}
                onChange={(e) => handleUpdate(q.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            )}

            {q.type === "single_choice" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleUpdate(q.id, opt)}
                      className={cn(
                        "type-label rounded-full border px-3.5 py-2 transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        selected
                          ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                          : "border-line bg-surface text-ink hover:bg-sunken",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "multi_choice" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = multiValue.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          handleUpdate(
                            q.id,
                            multiValue.filter((x) => x !== opt),
                          );
                        } else {
                          handleUpdate(q.id, [...multiValue, opt]);
                        }
                      }}
                      className={cn(
                        "type-label inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        selected
                          ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                          : "border-line bg-surface text-ink hover:bg-sunken",
                      )}
                    >
                      {selected ? <Check size={14} aria-hidden /> : null} {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "rating" && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => {
                  const selected = answers[q.id] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdate(q.id, val)}
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-full border font-semibold",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        selected
                          ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                          : "border-line bg-surface text-ink hover:bg-sunken",
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </OnboardingCard>
  );
}
