"use client";
import React from "react";
import { Target } from "lucide-react";
import { OnboardingCard, StepHeader } from "../onboarding-ui";

const GOALS = [
  "Get an internship", "Get a job", "Become a freelancer",
  "Build projects", "Prepare for placements", "Prepare for higher studies",
  "Learn a new skill", "Explore a career", "Build a startup", "Other",
];

export default function CareerGoalSection({
  data,
  onChange,
}: {
  data: any;
  onChange: (data: any) => void;
  hideRole?: boolean;
}) {
  const achieveGoal = data.achieveGoal || "";
  const roleLabel =
    data.customRole && data.roleOfInterest === "Other"
      ? data.customRole
      : data.roleOfInterest;

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "12px",
    fontWeight: 600,
    color: "var(--text-main)",
    fontFamily: "Outfit",
    fontSize: "18px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
  };

  const getCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: "16px",
    borderRadius: "12px",
    border: `2px solid ${selected ? "#00c9a7" : "var(--border-light)"}`,
    backgroundColor: selected ? "rgba(0, 201, 167, 0.1)" : "var(--bg-alt)",
    color: "var(--text-main)",
    cursor: "pointer",
    fontFamily: "Outfit",
    textAlign: "center",
    fontWeight: selected ? 600 : 400,
    transition: "all 0.2s",
  });

  return (
    <OnboardingCard accent="#00c9a7">
      <StepHeader
        icon={<Target size={22} color="#00c9a7" />}
        kicker="Outcome"
        title="Career goals"
        subtitle="The role is already locked from your path type. Here we only ask what you want to achieve."
      />

      {roleLabel ? (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: "var(--bg-alt)",
            border: "1px solid var(--border-light)",
            fontFamily: "Outfit",
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          Selected role: <b style={{ color: "var(--text-main)" }}>{roleLabel}</b>
        </div>
      ) : null}

      <div>
        <label style={labelStyle}>What do you want to achieve?</label>
        <div style={gridStyle}>
          {GOALS.map((goal) => (
            <div
              key={goal}
              style={getCardStyle(achieveGoal === goal)}
              onClick={() => onChange({ ...data, achieveGoal: goal })}
            >
              {goal}
            </div>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
