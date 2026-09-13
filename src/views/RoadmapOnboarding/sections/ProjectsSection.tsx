"use client";

import { Briefcase, Plus, Trash2 } from "lucide-react";
import { Button, Checkbox, IconButton, Input, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, StepHeader, labelClass } from "../onboarding-ui";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

type ProjectRow = {
  name: string;
  tech: string;
  difficulty: string;
  deployed: boolean;
  solo: boolean;
};

function asProjects(value: unknown): ProjectRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      return {
        name: typeof rec.name === "string" ? rec.name : "",
        tech: typeof rec.tech === "string" ? rec.tech : "",
        difficulty: typeof rec.difficulty === "string" ? rec.difficulty : "Beginner",
        deployed: Boolean(rec.deployed),
        solo: rec.solo !== false,
      };
    })
    .filter((p): p is ProjectRow => Boolean(p));
}

export default function ProjectsSection({
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
  const hasProjects = Boolean(data.hasProjects);
  const projects = asProjects(data.projects);
  const realWorldExperience =
    typeof data.realWorldExperience === "string" ? data.realWorldExperience : "";
  const experience = realWorldExperience && !stage.projects.experience.includes(realWorldExperience)
    ? [...stage.projects.experience, realWorldExperience]
    : stage.projects.experience;

  const addProject = () => {
    if (projects.length >= 5) return;
    onChange({
      ...data,
      projects: [
        ...projects,
        { name: "", tech: "", difficulty: "Beginner", deployed: false, solo: true },
      ],
    });
  };

  const updateProject = (index: number, field: keyof ProjectRow, value: string | boolean) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const removeProject = (index: number) => {
    onChange({ ...data, projects: projects.filter((_, i) => i !== index) });
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Briefcase size={22} aria-hidden />}
        kicker="Proof"
        title={stage.projects.title}
        subtitle={stage.projects.subtitle}
      />

      <div>
        <p className={labelClass}>{stage.projects.prompt}</p>
        <div className="flex gap-2.5">
          {["Yes", "No"].map((opt) => {
            const isYes = opt === "Yes";
            const selected = hasProjects === isYes;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onChange({ ...data, hasProjects: isYes, projects: isYes ? projects : [] })
                }
                className={cn(
                  "rounded-[var(--radius-md)] border px-8 py-3 font-semibold transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                    : "border-line bg-sunken text-ink hover:bg-surface",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {hasProjects && (
        <div className="flex flex-col gap-4">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="relative rounded-[var(--radius-md)] border border-line bg-sunken p-4"
            >
              <IconButton
                label={`Remove project ${idx + 1}`}
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3"
                onClick={() => removeProject(idx)}
              >
                <Trash2 size={16} />
              </IconButton>
              <div className="mt-2 flex flex-col gap-3 pr-10">
                <Input
                  placeholder={stage.projects.namePlaceholder}
                  value={proj.name}
                  onChange={(e) => updateProject(idx, "name", e.target.value)}
                />
                <Input
                  placeholder={stage.projects.techPlaceholder}
                  value={proj.tech}
                  onChange={(e) => updateProject(idx, "tech", e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={proj.difficulty}
                    onChange={(e) => updateProject(idx, "difficulty", e.target.value)}
                    className="w-auto min-w-40"
                    aria-label="Project difficulty"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                  <Checkbox
                    checked={proj.deployed}
                    onChange={(next) => updateProject(idx, "deployed", next)}
                    label="Deployed"
                  />
                  <Checkbox
                    checked={proj.solo}
                    onChange={(next) => updateProject(idx, "solo", next)}
                    label="Solo Project"
                  />
                </div>
              </div>
            </div>
          ))}
          {projects.length < 5 && (
            <Button variant="outline" onClick={addProject}>
              <Plus size={16} aria-hidden /> Add Project
            </Button>
          )}
        </div>
      )}

      <div>
        <p className={labelClass}>Real-world experience</p>
        <div className="flex flex-wrap gap-2.5">
          {experience.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => onChange({ ...data, realWorldExperience: exp })}
              className={cn(
                "type-label rounded-full border px-3.5 py-2 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                realWorldExperience === exp
                  ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
