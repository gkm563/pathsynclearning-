"use client";

import { useState, type FormEvent } from "react";
import { Check, Compass, Plus } from "lucide-react";
import { IconButton, Input, Textarea } from "@/components/ui";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

const SUGGESTED_SKILLS = [
  "React",
  "Node.js",
  "System Design",
  "Machine Learning",
  "AWS",
  "GraphQL",
  "TypeScript",
  "Docker",
  "Algorithms",
  "UI/UX",
];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export default function LearningGoalSection({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
}) {
  const learningGoals = asStringArray(data.learningGoals);
  const reason = typeof data.reason === "string" ? data.reason : "";
  const [customGoal, setCustomGoal] = useState("");

  const toggleGoal = (goal: string) => {
    if (learningGoals.includes(goal)) {
      onChange({ ...data, learningGoals: learningGoals.filter((g) => g !== goal) });
    } else {
      onChange({ ...data, learningGoals: [...learningGoals, goal] });
    }
  };

  const addCustomGoal = (e: FormEvent) => {
    e.preventDefault();
    if (customGoal.trim() && !learningGoals.includes(customGoal.trim())) {
      onChange({ ...data, learningGoals: [...learningGoals, customGoal.trim()] });
      setCustomGoal("");
    }
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Compass size={22} aria-hidden />}
        kicker="Role path"
        title="What else to learn"
        subtitle="Only asked on the general role path, not on company hiring paths."
      />

      <div>
        <p className={labelClass}>What do you want to learn?</p>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_SKILLS.map((skill) => {
            const selected = learningGoals.includes(skill);
            return (
              <Pill key={skill} selected={selected} onClick={() => toggleGoal(skill)}>
                {selected ? <Check size={14} aria-hidden /> : null} {skill}
              </Pill>
            );
          })}
          <form onSubmit={addCustomGoal} className="flex gap-2">
            <Input
              placeholder="Add other..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="min-h-9 w-36"
            />
            <IconButton type="submit" label="Add learning goal" variant="secondary" size="sm">
              <Plus size={16} />
            </IconButton>
          </form>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="learn-reason">
          Why do you want to learn these?
        </label>
        <Textarea
          id="learn-reason"
          placeholder="E.g. I want to build a full-stack SaaS app for my portfolio..."
          value={reason}
          onChange={(e) => onChange({ ...data, reason: e.target.value })}
        />
      </div>
    </OnboardingCard>
  );
}
