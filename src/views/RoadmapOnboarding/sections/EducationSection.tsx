"use client";

import { BookOpen, Check } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Programming",
  "Data Structures",
  "Databases",
  "Networks",
  "Operating Systems",
  "Web Development",
  "AI/ML",
  "Statistics",
  "Electronics",
  "Other",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "MSc", "PhD", "Other"];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export default function EducationSection({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
}) {
  const currentStudy = typeof data.currentStudy === "string" ? data.currentStudy : "";
  const yearSemester = typeof data.yearSemester === "string" ? data.yearSemester : "";
  const academicBackground =
    typeof data.academicBackground === "string" ? data.academicBackground : "";
  const enjoyedSubjects = asStringArray(data.enjoyedSubjects);
  const struggledSubjects = asStringArray(data.struggledSubjects);

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
        subtitle="Skip school-level nodes you already finished, and slow down topics you struggle with."
      />

      <div>
        <label className={labelClass} htmlFor="current-study">
          Current study / degree
        </label>
        <Input
          id="current-study"
          placeholder="e.g. B.Tech in Computer Science"
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
          placeholder="e.g. High school science with math"
          value={academicBackground}
          onChange={(e) => onChange({ ...data, academicBackground: e.target.value })}
        />
      </div>

      <div>
        <p className={labelClass}>Subjects you enjoy</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
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
          {SUBJECTS.map((sub) => (
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
