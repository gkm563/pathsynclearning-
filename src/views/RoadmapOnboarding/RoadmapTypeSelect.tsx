"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Building2, Compass, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { OTHER_COMPANY, OTHER_ROLE } from "@/lib/roadmap/target-companies";
import {
  ChoiceCard,
  OnboardingCard,
  Pill,
  SearchField,
  StepHeader,
  inputStyle,
  labelStyle,
} from "./onboarding-ui";

export type RoadmapGenerationMode = "targeted" | "general";

type CatalogCompany = {
  id: string;
  name: string;
  domain: string;
  kind: string;
  region: string;
  logo: string;
  stacks: string[];
  interviewLoop: string[];
  hiringNotes: string;
  roleNames: string[];
};

type CatalogRole = {
  id: string;
  name: string;
  summary: string;
};

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

  const [companies, setCompanies] = useState<CatalogCompany[]>([]);
  const [allRoles, setAllRoles] = useState<CatalogRole[]>([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  const [pairingMessage, setPairingMessage] = useState<string | null>(null);
  const [pairingOk, setPairingOk] = useState(true);

  useEffect(() => {
    apiGet<{ companies: CatalogCompany[]; roles: CatalogRole[] }>("/api/roadmap/catalog")
      .then((res) => {
        setCompanies(res.companies || []);
        setAllRoles(res.roles || []);
      })
      .catch(() => {});
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.name === targetCompany) || null,
    [companies, targetCompany],
  );

  const visibleCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.kind.toLowerCase().includes(q) ||
        c.stacks.some((s) => s.toLowerCase().includes(q)),
    );
  }, [companies, companyQuery]);

  const rolesForUi = useMemo(() => {
    const base = selectedCompany
      ? allRoles.filter((r) => selectedCompany.roleNames.includes(r.name))
      : allRoles;
    const q = roleQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) => r.name.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q),
    );
  }, [allRoles, selectedCompany, roleQuery]);

  useEffect(() => {
    if (mode !== "targeted") {
      setPairingMessage(null);
      return;
    }
    const companyName = targetCompany === OTHER_COMPANY ? customCompany : targetCompany;
    const roleName = roleOfInterest === OTHER_ROLE ? customRole : roleOfInterest;
    if (!companyName || !roleName || roleOfInterest === OTHER_ROLE) {
      setPairingMessage(null);
      setPairingOk(true);
      return;
    }
    let cancelled = false;
    apiSend<{ ok: boolean; message: string }>("/api/roadmap/catalog", "POST", {
      company: companyName,
      role: roleName,
    })
      .then((res) => {
        if (cancelled) return;
        setPairingOk(res.ok);
        setPairingMessage(res.message);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, targetCompany, customCompany, roleOfInterest, customRole, selectedCompany?.id]);

  return (
    <OnboardingCard accent={mode === "general" ? "#00c9a7" : "#6c63ff"}>
      <StepHeader
        kicker="Path type"
        title="How should we build this roadmap?"
        subtitle="Company paths follow real hiring loops. Role paths stay industry-general and never reuse the company questionnaire."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <ChoiceCard selected={mode === "targeted"} onClick={() => onModeChange("targeted")} accent="#6c63ff">
          <Building2 size={26} color="#6c63ff" />
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>Company hiring path</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Pick an employer, then only roles they actually hire. Interview prep matches their OA, machine coding, and values rounds.
          </div>
        </ChoiceCard>
        <ChoiceCard selected={mode === "general"} onClick={() => onModeChange("general")} accent="#00c9a7">
          <Compass size={26} color="#00c9a7" />
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>Role learning path</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Build skills for a role across the industry. Different questions, no company lock-in.
          </div>
        </ChoiceCard>
      </div>

      {mode === "targeted" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <label style={labelStyle}>Search companies</label>
            <SearchField value={companyQuery} onChange={setCompanyQuery} placeholder="Google, Razorpay, TCS…" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
                gap: 10,
                marginTop: 12,
                maxHeight: 280,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {visibleCompanies.map((company) => {
                const selected = targetCompany === company.name;
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        targetCompany: company.name,
                        customCompany: "",
                        roleOfInterest: company.roleNames.includes(roleOfInterest) ? roleOfInterest : "",
                      })
                    }
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: `2px solid ${selected ? "#6c63ff" : "var(--border-light)"}`,
                      background: selected ? "rgba(108,99,255,0.1)" : "var(--bg-alt)",
                      cursor: "pointer",
                      color: "var(--text-main)",
                    }}
                  >
                    <img src={company.logo} alt="" width={22} height={22} style={{ borderRadius: 6 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{company.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{company.region}</div>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onChange({ ...data, targetCompany: OTHER_COMPANY })}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: `2px dashed ${targetCompany === OTHER_COMPANY ? "#6c63ff" : "var(--border-light)"}`,
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-main)",
                  fontWeight: 700,
                }}
              >
                Other company
              </button>
            </div>
            {targetCompany === OTHER_COMPANY ? (
              <input
                style={{ ...inputStyle, marginTop: 12 }}
                placeholder="Company name"
                value={customCompany}
                onChange={(e) => onChange({ ...data, customCompany: e.target.value })}
              />
            ) : null}
          </div>

          {selectedCompany ? (
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{selectedCompany.name} hiring snapshot</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                {selectedCompany.hiringNotes}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {selectedCompany.interviewLoop.map((step) => (
                  <span
                    key={step}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label style={labelStyle}>
              {selectedCompany ? `Roles ${selectedCompany.name} hires` : "Target role"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Search size={16} color="var(--text-muted)" />
              <SearchField value={roleQuery} onChange={setRoleQuery} placeholder="Filter roles…" />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {rolesForUi.map((role) => (
                <Pill
                  key={role.id}
                  selected={roleOfInterest === role.name}
                  onClick={() =>
                    onChange({ ...data, roleOfInterest: role.name, customRole: "" })
                  }
                >
                  {role.name}
                </Pill>
              ))}
              {(!selectedCompany || targetCompany === OTHER_COMPANY) && (
                <Pill
                  selected={roleOfInterest === OTHER_ROLE}
                  onClick={() => onChange({ ...data, roleOfInterest: OTHER_ROLE })}
                  accent="#f7971e"
                >
                  Other role
                </Pill>
              )}
            </div>
            {roleOfInterest === OTHER_ROLE ? (
              <input
                style={{ ...inputStyle, marginTop: 12 }}
                placeholder="Job role"
                value={customRole}
                onChange={(e) => onChange({ ...data, customRole: e.target.value })}
              />
            ) : null}
            {rolesForUi[0] && roleOfInterest && roleOfInterest !== OTHER_ROLE ? (
              <p style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
                {rolesForUi.find((r) => r.name === roleOfInterest)?.summary}
              </p>
            ) : null}
          </div>

          {pairingMessage ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: 12,
                borderRadius: 12,
                background: pairingOk ? "rgba(0,201,167,0.1)" : "rgba(239,68,68,0.1)",
                color: "var(--text-main)",
                fontSize: 13,
              }}
            >
              {pairingOk ? <ShieldCheck size={18} color="#00c9a7" /> : <TriangleAlert size={18} color="#ef4444" />}
              <span>{pairingMessage}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "general" ? (
        <div>
          <label style={labelStyle}>Which role is this path for?</label>
          <SearchField value={roleQuery} onChange={setRoleQuery} placeholder="Search roles…" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {(roleQuery
              ? allRoles.filter(
                  (r) =>
                    r.name.toLowerCase().includes(roleQuery.toLowerCase()) ||
                    r.summary.toLowerCase().includes(roleQuery.toLowerCase()),
                )
              : allRoles
            ).map((role) => (
              <Pill
                key={role.id}
                selected={roleOfInterest === role.name}
                onClick={() => onChange({ ...data, roleOfInterest: role.name, customRole: "" })}
              >
                {role.name}
              </Pill>
            ))}
            <Pill
              selected={roleOfInterest === OTHER_ROLE}
              onClick={() => onChange({ ...data, roleOfInterest: OTHER_ROLE })}
              accent="#f7971e"
            >
              Other
            </Pill>
          </div>
          {roleOfInterest === OTHER_ROLE ? (
            <input
              style={{ ...inputStyle, marginTop: 12 }}
              placeholder="Job role"
              value={customRole}
              onChange={(e) => onChange({ ...data, customRole: e.target.value })}
            />
          ) : null}
        </div>
      ) : null}
    </OnboardingCard>
  );
}
