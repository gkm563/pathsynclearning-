"use client";

import { useMemo, useState } from "react";
import type { ChallengeSummary } from "@/lib/challenges/types";
import ChallengeResultScreen from "@/components/challenges/ChallengeResultScreen";
import { Button, Card, Checkbox } from "@/components/ui";

export default function ChallengeDesignIde({
  item,
  onClose,
  onFinished,
}: {
  item: ChallengeSummary;
  onClose: () => void;
  onFinished: (payload: {
    score: number;
    passed: boolean;
    writeup: string;
    dimensionIds: string[];
  }) => void;
}) {
  const spec = item.design;
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [writeup, setWriteup] = useState(item.lastAttempt?.writeup || "");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const dims = spec?.dimensions || [];

  const preview = useMemo(() => {
    const chosen = Object.entries(picked)
      .filter(([, v]) => v)
      .map(([id]) => id);
    const total = dims.reduce((s, d) => s + d.weight, 0);
    const earned = dims
      .filter((d) => chosen.includes(d.id))
      .reduce((s, d) => s + d.weight, 0);
    const text = writeup.trim();
    const writeupScore = text.length >= 240 ? 15 : text.length >= 80 ? 8 : 0;
    const base = total ? (earned / total) * 85 : 0;
    return Math.min(100, Math.round(base + writeupScore));
  }, [dims, picked, writeup]);

  if (!spec) {
    return (
      <Card className="p-6">
        <p className="type-small text-muted">This design prompt is incomplete.</p>
        <Button className="mt-3" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Card>
    );
  }

  if (showResult) {
    return (
      <ChallengeResultScreen
        score={score}
        passed={passed}
        passMark={spec.passScore || 70}
        xp={item.xp}
        coins={item.coins}
        onDone={onClose}
        onRetry={() => setShowResult(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-canvas/95 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="type-caption m-0 text-muted">System design</p>
              <h2 className="type-h3 mt-1 mb-0 text-ink">{item.title}</h2>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="type-small m-0 text-muted">{item.prompt}</p>
          <div>
            <p className="type-label mb-2 text-ink">Functional requirements</p>
            <ul className="type-small m-0 text-muted">
              {spec.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label mb-2 text-ink">Non-functional</p>
            <ul className="type-small m-0 text-muted">
              {spec.nonFunctional.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <pre className="type-code overflow-auto rounded-[var(--radius-md)] border border-line bg-sunken p-3 text-ink">
            {spec.apiSketch}
          </pre>
          <p className="type-label m-0 text-ink">Cover these dimensions</p>
          <div className="flex flex-col gap-2">
            {dims.map((d) => (
              <Checkbox
                key={d.id}
                checked={Boolean(picked[d.id])}
                onChange={(next) =>
                  setPicked((p) => ({ ...p, [d.id]: next }))
                }
                label={`${d.label} · ${d.weight}`}
                description={d.prompt}
              />
            ))}
          </div>
          <label className="type-label text-ink">
            Design write-up
            <textarea
              className="mt-2 min-h-40 w-full rounded-[var(--radius-md)] border border-line bg-sunken p-3 type-small text-ink"
              value={writeup}
              onChange={(e) => setWriteup(e.target.value)}
              placeholder="APIs, data model, scaling, and the trade-off you would defend in an interview."
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="type-caption m-0 text-muted">Preview score {preview}%</p>
            <Button
              onClick={() => {
                const dimensionIds = Object.entries(picked)
                  .filter(([, v]) => v)
                  .map(([id]) => id);
                const nextScore = preview;
                const nextPassed = nextScore >= (spec.passScore || 70);
                setScore(nextScore);
                setPassed(nextPassed);
                onFinished({
                  score: nextScore,
                  passed: nextPassed,
                  writeup,
                  dimensionIds,
                });
                setShowResult(true);
              }}
            >
              Submit design
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
