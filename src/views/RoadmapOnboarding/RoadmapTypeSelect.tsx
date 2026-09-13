"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Compass, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { OTHER_COMPANY, OTHER_ROLE } from "@/lib/roadmap/hiring-catalog";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { Badge, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  ChoiceCard,
  OnboardingCard,
  Pill,
  SearchField,
  StepHeader,
  labelClass,
} from "./onboarding-ui";

export type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";

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
     
  }, [mode, targetCompany, customCompany, roleOfInterest, customRole, selectedCompany?.id]);

  return (
    <OnboardingCard>
      <StepHeader
        kicker="Path type"
        title="How should we build this roadmap?"
        subtitle="Company paths follow real hiring loops. Role paths stay industry-general and never reuse the company questionnaire."
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ChoiceCard selected={mode === "targeted"} onClick={() => onModeChange("targeted")}>
          <Building2 size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Company hiring path</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Pick an employer, then only roles they actually hire. Interview prep matches their OA, machine coding, and values rounds.
          </p>
        </ChoiceCard>
        <ChoiceCard selected={mode === "general"} onClick={() => onModeChange("general")}>
          <Compass size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Role learning path</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Build skills for a role across the industry. Different questions, no company lock-in.
          </p>
        </ChoiceCard>
      </div>

      {mode === "targeted" ? (
        <div className="flex flex-col gap-6">
          <div>
            <label className={labelClass}>Search companies</label>
            <SearchField value={companyQuery} onChange={setCompanyQuery} placeholder="Google, Razorpay, TCS…" />
            <div className="mt-3 grid max-h-72 grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2.5 overflow-y-auto pr-1">
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
                        roleOfInterest: company.roleNames.includes(roleOfInterest)
                          ? roleOfInterest
                          : "",
                      })
                    }
                    className={cn(
                      "flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      selected
                        ? "border-primary-border bg-primary-soft"
                        : "border-line bg-sunken hover:bg-surface",
                    )}
                  >
                    <img
                      src={company.logo}
                      alt=""
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] rounded-[6px]"
                    />
                    <div className="min-w-0">
                      <p className="type-label m-0 truncate text-ink">{company.name}</p>
                      <p className="type-caption m-0 text-muted">{company.region}</p>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onChange({ ...data, targetCompany: OTHER_COMPANY })}
                className={cn(
                  "rounded-[var(--radius-md)] border border-dashed px-3 py-3 font-semibold text-ink",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  targetCompany === OTHER_COMPANY
                    ? "border-primary-border bg-primary-soft"
                    : "border-line",
                )}
              >
                Other company
              </button>
            </div>
            {targetCompany === OTHER_COMPANY ? (
              <Input
                className="mt-3"
                placeholder="Company name"
                value={customCompany}
                onChange={(e) => onChange({ ...data, customCompany: e.target.value })}
              />
            ) : null}
          </div>

          {selectedCompany ? (
            <div className="rounded-[var(--radius-md)] border border-line bg-sunken p-4">
              <p className="type-label m-0 mb-1.5 text-ink">
                {selectedCompany.name} hiring snapshot
              </p>
              <p className="type-small m-0 text-muted">{selectedCompany.hiringNotes}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {selectedCompany.interviewLoop.map((step) => (
                  <Badge key={step} className="normal-case tracking-normal">
                    {step}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label className={labelClass}>
              {selectedCompany ? `Roles ${selectedCompany.name} hires` : "Target role"}
            </label>
            <div className="mb-2.5 flex items-center gap-2">
              <Search size={16} className="shrink-0 text-muted" aria-hidden />
              <SearchField value={roleQuery} onChange={setRoleQuery} placeholder="Filter roles…" />
            </div>
            <div className="flex flex-wrap gap-2">
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
                >
                  Other role
                </Pill>
              )}
            </div>
            {roleOfInterest === OTHER_ROLE ? (
              <Input
                className="mt-3"
                placeholder="Job role"
                value={customRole}
                onChange={(e) => onChange({ ...data, customRole: e.target.value })}
              />
            ) : null}
            {rolesForUi[0] && roleOfInterest && roleOfInterest !== OTHER_ROLE ? (
              <p className="type-small mt-2.5 mb-0 text-muted">
                {rolesForUi.find((r) => r.name === roleOfInterest)?.summary}
              </p>
            ) : null}
          </div>

          {pairingMessage ? (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5",
                pairingOk
                  ? "border-[color-mix(in_srgb,var(--success)_30%,var(--border-light))] bg-[var(--success-soft)]"
                  : "border-[color-mix(in_srgb,var(--error)_30%,var(--border-light))] bg-[var(--error-soft)]",
              )}
            >
              {pairingOk ? (
                <ShieldCheck size={18} className="shrink-0 text-success" aria-hidden />
              ) : (
                <TriangleAlert size={18} className="shrink-0 text-danger" aria-hidden />
              )}
              <span className="type-small text-ink">{pairingMessage}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "general" ? (
        <div>
          <label className={labelClass}>Which role is this path for?</label>
          <SearchField value={roleQuery} onChange={setRoleQuery} placeholder="Search roles…" />
          <div className="mt-3 flex flex-wrap gap-2">
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
            >
              Other
            </Pill>
          </div>
          {roleOfInterest === OTHER_ROLE ? (
            <Input
              className="mt-3"
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
