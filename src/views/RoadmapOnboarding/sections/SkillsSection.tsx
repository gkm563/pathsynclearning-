"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Wrench, X } from "lucide-react";
import { IconButton, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  generationStageQuestionsFromForm,
  isCanonicalStageSkill,
} from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

const CONFIDENCE_LEVELS = [
  "Never used",
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Very confident",
];

type SkillRow = { skill: string; confidence: string };

function asSkills(value: unknown): SkillRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      if (typeof rec.skill !== "string") return null;
      return {
        skill: rec.skill,
        confidence: typeof rec.confidence === "string" ? rec.confidence : "Beginner",
      };
    })
    .filter((s): s is SkillRow => Boolean(s));
}

export default function SkillsSection({
  data,
  onChange,
  mode = null,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
  mode?: RoadmapGenerationMode | null;
}) {
  const stage = generationStageQuestionsFromForm(data, mode);
  const options = stage.skills.options;
  const optionSet = useMemo(
    () => new Set(options.map((s) => s.toLowerCase())),
    [options],
  );
  const skills = asSkills(data.skills);
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    const next = skills.filter(
      (row) =>
        optionSet.has(row.skill.toLowerCase()) || !isCanonicalStageSkill(row.skill),
    );
    if (next.length === skills.length) return;
    onChange({ ...data, skills: next });
    // Only prune when the path's skill catalog changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.pathLabel, options.join("|")]);

  const toggleSkill = (skill: string) => {
    const existing = skills.find((s) => s.skill === skill);
    if (existing) {
      onChange({ ...data, skills: skills.filter((s) => s.skill !== skill) });
    } else {
      onChange({ ...data, skills: [...skills, { skill, confidence: "Beginner" }] });
    }
  };

  const updateConfidence = (skill: string, confidence: string) => {
    onChange({
      ...data,
      skills: skills.map((s) => (s.skill === skill ? { ...s, confidence } : s)),
    });
  };

  const addCustomSkill = (e: FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.find((s) => s.skill === customSkill.trim())) {
      onChange({
        ...data,
        skills: [...skills, { skill: customSkill.trim(), confidence: "Beginner" }],
      });
      setCustomSkill("");
    }
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Wrench size={22} aria-hidden />}
        kicker="Baseline"
        title={stage.skills.title}
        subtitle={stage.skills.subtitle}
      />

      <div>
        <p className={labelClass}>{stage.skills.prompt}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {options.map((skill) => (
            <Pill
              key={skill}
              selected={Boolean(skills.find((s) => s.skill === skill))}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Pill>
          ))}
          <form onSubmit={addCustomSkill} className="flex gap-2">
            <Input
              placeholder="Add other skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="min-h-9 w-40"
            />
            <IconButton type="submit" label="Add skill" variant="secondary" size="sm">
              <Plus size={16} />
            </IconButton>
          </form>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <p className={labelClass}>Rate your confidence in these skills:</p>
          <div className="flex flex-col gap-3">
            {skills.map((item) => (
              <div
                key={item.skill}
                className="rounded-[var(--radius-md)] border border-line bg-sunken p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="type-label text-ink">{item.skill}</span>
                  <IconButton
                    label={`Remove ${item.skill}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSkill(item.skill)}
                  >
                    <X size={16} />
                  </IconButton>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CONFIDENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateConfidence(item.skill, level)}
                      className={cn(
                        "type-caption whitespace-nowrap rounded-full border px-3 py-1.5",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        item.confidence === level
                          ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                          : "border-line bg-surface text-muted hover:text-ink",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OnboardingCard>
  );
}
