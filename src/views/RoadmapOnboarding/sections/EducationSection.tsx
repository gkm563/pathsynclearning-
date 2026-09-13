"use client";

import { BookOpen, Check } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "MSc", "PhD", "Other"];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export default function EducationSection({
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
  const currentStudy = typeof data.currentStudy === "string" ? data.currentStudy : "";
  const yearSemester = typeof data.yearSemester === "string" ? data.yearSemester : "";
  const academicBackground =
    typeof data.academicBackground === "string" ? data.academicBackground : "";
  const enjoyedSubjects = asStringArray(data.enjoyedSubjects);
  const struggledSubjects = asStringArray(data.struggledSubjects);
  const subjects = [
    ...stage.education.subjects,
    ...enjoyedSubjects.filter((s) => !stage.education.subjects.includes(s)),
    ...struggledSubjects.filter(
      (s) => !stage.education.subjects.includes(s) && !enjoyedSubjects.includes(s),
    ),
    "Other",
  ].filter((s, i, arr) => arr.indexOf(s) === i);

  const toggleSubject = (field: "enjoyedSubjects" | "struggledSubjects", subject: string) => {
    const list = asStringArray(data[field]);
    if (list.includes(subject)) {
      onChange({ ...data, [field]: list.filter((s) => s !== subject) });
    } else {
      onChange({ ...data, [field]: [...list, subject] });
    }
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<BookOpen size={22} aria-hidden />}
        kicker="Background"
        title="Education"
        subtitle={stage.education.subtitle}
      />

      <div>
        <label className={labelClass} htmlFor="current-study">
          Current study / degree
        </label>
        <Input
          id="current-study"
          placeholder={stage.education.studyPlaceholder}
          value={currentStudy}
          onChange={(e) => onChange({ ...data, currentStudy: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="year-semester">
          Year / semester
        </label>
        <Select
          id="year-semester"
          value={yearSemester}
          onChange={(e) => onChange({ ...data, yearSemester: e.target.value })}
        >
          <option value="">Select year…</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className={labelClass} htmlFor="academic-bg">
          Academic background
        </label>
        <Input
          id="academic-bg"
          placeholder={stage.education.backgroundPlaceholder}
          value={academicBackground}
          onChange={(e) => onChange({ ...data, academicBackground: e.target.value })}
        />
      </div>

      <div>
        <p className={labelClass}>Subjects you enjoy</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <Pill
              key={sub}
              selected={enjoyedSubjects.includes(sub)}
              onClick={() => toggleSubject("enjoyedSubjects", sub)}
            >
              {enjoyedSubjects.includes(sub) ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} aria-hidden /> {sub}
                </span>
              ) : (
                sub
              )}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass}>Subjects you struggle with</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <Pill
              key={`s-${sub}`}
              selected={struggledSubjects.includes(sub)}
              onClick={() => toggleSubject("struggledSubjects", sub)}
            >
              {struggledSubjects.includes(sub) ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} aria-hidden /> {sub}
                </span>
              ) : (
                sub
              )}
            </Pill>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
