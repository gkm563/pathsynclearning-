"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { ApiClientError, apiGet, apiSend } from "@/lib/api";
import { previewCareerCri } from "@/lib/career/match";
import { HIRING_ROLES } from "@/lib/roadmap/hiring-catalog";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  Input,
  useToast,
} from "@/components/ui";

type CareerApi = {
  targetRole: string | null;
  careerGoal: string | null;
  cri: number;
  studentSkills: string[];
  previousRole?: string | null;
  previousCri?: number;
  matchedSkills?: string[];
  startsFromBeginning?: boolean;
};

function careerLabel(role: string, goal: string) {
  return role.trim() || goal.trim() || "";
}

function messageFor(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function CareerSection({
  targetRole,
  careerGoal,
  cri,
  onApplied,
}: {
  targetRole: string;
  careerGoal: string;
  cri: number;
  onApplied: (next: { targetRole: string; careerGoal: string; cri: number }) => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const current = careerLabel(targetRole, careerGoal);
  const knownNames = useMemo(() => new Set(HIRING_ROLES.map((r) => r.name)), []);
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [picked, setPicked] = useState(current && knownNames.has(current) ? current : "");
  const [custom, setCustom] = useState(current && !knownNames.has(current) ? current : "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const known = Boolean(current) && knownNames.has(current);
    setPicked(known ? current : "");
    setCustom(known ? "" : current);
  }, [current, knownNames]);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ career: CareerApi }>("/api/me/career")
      .then((res) => {
        if (cancelled) return;
        setStudentSkills(res.career.studentSkills ?? []);
      })
      .catch(() => {
        if (!cancelled) setStudentSkills([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nextRole = (custom.trim() || picked).trim();
  const unchanged =
    Boolean(current) && nextRole.toLowerCase() === current.toLowerCase();
  const preview = nextRole ? previewCareerCri(studentSkills, nextRole) : null;

  const apply = async () => {
    if (!nextRole || unchanged) return;
    setSaving(true);
    try {
      const res = await apiSend<{ career: CareerApi }>(
        "/api/me/career",
        "POST",
        { targetRole: nextRole },
      );
      const career = res.career;
      onApplied({
        targetRole: career.targetRole || nextRole,
        careerGoal: career.careerGoal || nextRole,
        cri: career.cri,
      });
      setConfirmOpen(false);
      if (career.startsFromBeginning) {
        toast.info("Career updated. No matching skills — CRI is 0 and you start from the beginning.");
      } else {
        toast.success(
          `Career updated. CRI is now ${career.cri}% for ${career.targetRole}.`,
        );
      }
    } catch (e) {
      toast.error(messageFor(e, "Unable to change career"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="flex min-w-0 flex-col gap-5">
        <div>
          <h3 className="type-h4 m-0 text-ink">Career path</h3>
          <p className="type-small mt-1 mb-0 text-muted">
            CRI is scored for this role. Changing career recalculates it from skills that still apply.
          </p>
        </div>

        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="type-caption m-0 text-faint">Current career</dt>
            <dd className="type-body m-0 mt-1 font-semibold text-ink">
              {current || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="type-caption m-0 text-faint">CRI for this career</dt>
            <dd className="type-body m-0 mt-1 font-semibold text-ink">{cri}%</dd>
          </div>
        </dl>

        <div>
          <p className="type-label mb-3 text-ink">Choose a new career</p>
          <div className="flex flex-wrap gap-2">
            {HIRING_ROLES.map((role) => {
              const selected = picked === role.name && !custom.trim();
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setPicked(role.name);
                    setCustom("");
                  }}
                  className={cn(
                    "type-small rounded-full border px-3 py-2 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    selected
                      ? "border-primary-border bg-primary-soft font-semibold text-ink"
                      : "border-line bg-sunken text-ink hover:bg-surface",
                  )}
                >
                  {role.name}
                </button>
              );
            })}
          </div>
          <label className="type-label mt-4 mb-2 block text-ink" htmlFor="profile-custom-role">
            Or type a different role
          </label>
          <Input
            id="profile-custom-role"
            placeholder="e.g. Game developer"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              if (e.target.value.trim()) setPicked("");
            }}
          />
        </div>

        {preview && nextRole && !unchanged ? (
          <Alert
            tone={preview.startsFromBeginning ? "warning" : "info"}
            title={
              preview.startsFromBeginning
                ? "You would start from the beginning"
                : "CRI will update for the new career"
            }
          >
            {preview.startsFromBeginning ? (
              <p className="m-0">
                None of your current skills match {nextRole}. CRI would go from {cri}% to 0%,
                and your active roadmap would be cleared so you begin that path from the start.
              </p>
            ) : (
              <p className="m-0">
                {preview.matchedSkills.length} of {preview.roleSkills.length} skills for{" "}
                {nextRole} already match. CRI would change from {cri}% to {preview.cri}%. Your
                current roadmap will be deactivated so a new one can be built for this career.
              </p>
            )}
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            className="min-h-11"
            disabled={!nextRole || unchanged}
            onClick={() => setConfirmOpen(true)}
          >
            <Briefcase size={15} aria-hidden />
            Change career
          </Button>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => router.push(routes.app.roadmapPersonalize)}
          >
            Personalize roadmap
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void apply()}
        title="Change career?"
        tone={preview?.startsFromBeginning ? "danger" : "primary"}
        confirmLabel={preview?.startsFromBeginning ? "Start from the beginning" : "Update career and CRI"}
        loading={saving}
        confirmDisabled={!nextRole || unchanged}
        description={`Switch from ${current || "no career"} to ${nextRole || "the selected role"}.`}
      >
        {preview?.startsFromBeginning ? (
          <p className="type-small m-0 text-muted">
            No skills match this career. Your CRI will reset to 0% and you will start this path
            from the beginning.
          </p>
        ) : (
          <p className="type-small m-0 text-muted">
            CRI will be recalculated for {nextRole}
            {preview ? ` (${cri}% → ${preview.cri}%)` : ""}. Skills that do not apply to the new
            career will not count.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
