"use client";
import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

const GOALS = [
  "Get an internship", "Get a job", "Become a freelancer",
  "Build projects", "Prepare for placements", "Prepare for higher studies",
  "Learn a new skill", "Explore a career", "Build a startup", "Other",
];

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "AI/ML Engineer", "Data Scientist",
  "Cybersecurity Engineer", "Cloud/DevOps Engineer", "UI/UX Designer",
  "Product Manager", "Data Analyst", "Other",
];

export default function CareerGoalSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const achieveGoal = data.achieveGoal || "";
  const roleOfInterest = data.roleOfInterest || "";
  const customRole = data.customRole || "";

  const containerStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: "24px",
    backgroundColor: "var(--bg-card)", padding: "32px",
    borderRadius: "16px", border: "1px solid var(--border-light)",
  };

  const titleStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "12px",
    fontSize: "24px", fontWeight: "bold", fontFamily: "Outfit",
    color: "var(--text-main)", marginBottom: "8px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "12px", fontWeight: 600,
    color: "var(--text-main)", fontFamily: "Outfit", fontSize: "18px",
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: "8px",
    border: "1px solid var(--border-light)", backgroundColor: "var(--bg-main)",
    color: "var(--text-main)", fontFamily: "Outfit", fontSize: "16px",
    marginTop: "12px", outline: "none",
  };

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <Target size={28} color="#00c9a7" />
        🎯 Career Goals
      </div>

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

      <div>
        <label style={labelStyle}>What role are you interested in?</label>
        <div style={gridStyle}>
          {ROLES.map((role) => (
            <div
              key={role}
              style={getCardStyle(roleOfInterest === role)}
              onClick={() => onChange({ ...data, roleOfInterest: role, customRole: role === "Other" ? customRole : "" })}
            >
              {role}
            </div>
          ))}
        </div>
        {roleOfInterest === "Other" && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={inputStyle}
            placeholder="Please specify..."
            value={customRole}
            onChange={(e) => onChange({ ...data, customRole: e.target.value })}
          />
        )}
      </div>
    </motion.div>
  );
}
