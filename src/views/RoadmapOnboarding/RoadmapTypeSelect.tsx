"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, Compass } from "lucide-react";
import {
  OTHER_COMPANY,
  OTHER_ROLE,
  TARGET_COMPANIES,
  TARGET_ROLES,
} from "@/lib/roadmap/target-companies";

export type RoadmapGenerationMode = "targeted" | "general";

export default function RoadmapTypeSelect({
  mode,
  data,
  onModeChange,
  onChange,
}: {
  mode: RoadmapGenerationMode | null;
  data: Record<string, unknown>;
  onModeChange: (mode: RoadmapGenerationMode) => void;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const targetCompany = typeof data.targetCompany === "string" ? data.targetCompany : "";
  const customCompany = typeof data.customCompany === "string" ? data.customCompany : "";
  const roleOfInterest = typeof data.roleOfInterest === "string" ? data.roleOfInterest : "";
  const customRole = typeof data.customRole === "string" ? data.customRole : "";

  const card = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 240,
    padding: 24,
    borderRadius: 16,
    border: `2px solid ${selected ? "#6c63ff" : "var(--border-light)"}`,
    backgroundColor: selected ? "rgba(108, 99, 255, 0.08)" : "var(--bg-alt)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "Outfit",
    color: "var(--text-main)",
    transition: "all 0.2s",
  });

  const chip = (selected: boolean): React.CSSProperties => ({
    padding: "12px 14px",
    borderRadius: 12,
    border: `2px solid ${selected ? "#00c9a7" : "var(--border-light)"}`,
    backgroundColor: selected ? "rgba(0, 201, 167, 0.1)" : "var(--bg-alt)",
    color: "var(--text-main)",
    cursor: "pointer",
    fontFamily: "Outfit",
    textAlign: "center",
    fontWeight: selected ? 600 : 400,
    fontSize: 14,
    transition: "all 0.2s",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid var(--border-light)",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-main)",
    fontFamily: "Outfit",
    fontSize: 16,
    marginTop: 12,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 12,
    fontWeight: 600,
    color: "var(--text-main)",
    fontFamily: "Outfit",
    fontSize: 18,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "var(--bg-card)",
        padding: 32,
        borderRadius: 16,
        border: "1px solid var(--border-light)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Outfit",
            color: "var(--text-main)",
          }}
        >
          How should we build this roadmap?
        </div>
        <p
          style={{
            fontFamily: "Outfit",
            fontSize: 15,
            color: "var(--text-muted)",
            margin: "8px 0 0",
          }}
        >
          Choose a company and job-role path, or a general learning path like before.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button type="button" style={card(mode === "targeted")} onClick={() => onModeChange("targeted")}>
          <Building2 size={28} color="#6c63ff" />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Company or job role</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.45 }}>
            Aim at a specific employer and role, including interview prep and the skills they typically hire for.
          </div>
        </button>
        <button type="button" style={card(mode === "general")} onClick={() => onModeChange("general")}>
          <Compass size={28} color="#00c9a7" />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>General roadmap</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.45 }}>
            Build a personalized path from your goals, skills, and time — same as the previous experience.
          </div>
        </button>
      </div>

      {mode === "targeted" ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={labelStyle}>Target company</label>
            <div style={gridStyle}>
              {[...TARGET_COMPANIES, OTHER_COMPANY].map((company) => (
                <div
                  key={company}
                  role="button"
                  tabIndex={0}
                  style={chip(targetCompany === company)}
                  onClick={() =>
                    onChange({
                      ...data,
                      targetCompany: company,
                      customCompany: company === OTHER_COMPANY ? customCompany : "",
                    })
                  }
                >
                  {company}
                </div>
              ))}
            </div>
            {targetCompany === OTHER_COMPANY ? (
              <input
                style={inputStyle}
                placeholder="Company name..."
                value={customCompany}
                onChange={(e) => onChange({ ...data, customCompany: e.target.value })}
              />
            ) : null}
          </div>

          <div>
            <label style={labelStyle}>Target job role</label>
            <div style={gridStyle}>
              {[...TARGET_ROLES, OTHER_ROLE].map((role) => (
                <div
                  key={role}
                  role="button"
                  tabIndex={0}
                  style={chip(roleOfInterest === role)}
                  onClick={() =>
                    onChange({
                      ...data,
                      roleOfInterest: role,
                      customRole: role === OTHER_ROLE ? customRole : "",
                    })
                  }
                >
                  {role}
                </div>
              ))}
            </div>
            {roleOfInterest === OTHER_ROLE ? (
              <input
                style={inputStyle}
                placeholder="Job role..."
                value={customRole}
                onChange={(e) => onChange({ ...data, customRole: e.target.value })}
              />
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
