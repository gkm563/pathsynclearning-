"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useStudent } from "@/components/dashboard/StudentContext";
import {
  CRI_COMPONENT_LABEL,
  CRI_DISCLAIMER,
  type CriComponentId,
} from "@/lib/cri/formula";
import { formatCri } from "@/lib/cri/milli";
import { Alert, Button, Dialog } from "@/components/ui";

type ComponentDto = {
  id: CriComponentId;
  publishedWeightPct: number;
  liveWeightMilli: number;
  scoreMilli: number;
  contributionMilli: number;
  status: "ok" | "missing" | "not_scored";
};

type CriDto = {
  formulaId: string;
  criMilli: number;
  cri: string;
  targetRole: string | null;
  computedAt: string | null;
  components: ComponentDto[];
  disclaimer: string;
  snapshotId: string | null;
};

type EvidenceDto = {
  id: string;
  sourceType: string;
  sourceId: string;
  metric: string;
  valueMilli: number;
};

export function WhyCriDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { refresh } = useStudent();
  const [data, setData] = useState<CriDto | null>(null);
  const [error, setError] = useState("");
  const [component, setComponent] = useState<CriComponentId | null>(null);
  const [evidence, setEvidence] = useState<EvidenceDto[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError("");
    apiGet<CriDto>("/api/me/cri")
      .then((res) => {
        if (!cancelled) {
          setData(res);
          void refresh();
        }
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load CRI breakdown.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, refresh]);

  useEffect(() => {
    if (!open || !component) {
      setEvidence([]);
      return;
    }
    let cancelled = false;
    apiGet<{ evidence: EvidenceDto[] }>(
      `/api/me/cri/evidence?component=${encodeURIComponent(component)}`,
    )
      .then((res) => {
        if (!cancelled) setEvidence(res.evidence);
      })
      .catch(() => {
        if (!cancelled) setEvidence([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, component]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Why this CRI?"
      description={
        data
          ? `${data.cri}% for ${data.targetRole || "no target career"} · formula ${data.formulaId}`
          : "Evidence-backed Career Readiness Index"
      }
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      {data ? (
        <div className="flex flex-col gap-4">
          <p className="type-numeric m-0 text-3xl font-semibold text-ink">
            {data.cri}%
          </p>
          <Alert tone="info" title="Readiness, not a hire signal">
            {data.disclaimer || CRI_DISCLAIMER}
          </Alert>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {data.components.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setComponent(row.id)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2 text-left hover:bg-surface"
                >
                  <span>
                    <span className="type-label block text-ink">
                      {CRI_COMPONENT_LABEL[row.id]}
                    </span>
                    <span className="type-caption text-faint">
                      {row.publishedWeightPct}% published · {row.status}
                    </span>
                  </span>
                  <span className="type-small font-semibold text-ink">
                    {formatCri(row.scoreMilli)} → {formatCri(row.contributionMilli)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {component ? (
            <div>
              <p className="type-label m-0 text-ink">
                Evidence · {CRI_COMPONENT_LABEL[component]}
              </p>
              {evidence.length === 0 ? (
                <p className="type-small mt-2 mb-0 text-muted">
                  No verified evidence rows for this component.
                </p>
              ) : (
                <ul className="type-small mt-2 mb-0 flex list-none flex-col gap-1 p-0 text-muted">
                  {evidence.map((row) => (
                    <li key={row.id}>
                      <span className="font-mono text-ink">{row.id.slice(0, 8)}</span>
                      {" · "}
                      {row.sourceType}/{row.metric} · {formatCri(row.valueMilli)}%
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
