"use client";

import { UserRound } from "lucide-react";
import { Input, Select } from "@/components/ui";
import {
  OnboardingCard,
  StepHeader,
  labelClass,
} from "@/views/RoadmapOnboarding/onboarding-ui";
import type { OnboardingBasics } from "@/lib/onboarding/types";

const DEGREES = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "BCA",
  "M.Tech",
  "MCA",
  "MBA",
  "Other",
];

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "AI / ML",
  "Data Science",
  "Other",
];

function gradYearOptions() {
  const year = new Date().getFullYear();
  const years: string[] = [];
  for (let y = year + 6; y >= year - 8; y -= 1) years.push(String(y));
  return years;
}

export default function BasicsStep({
  data,
  onChange,
}: {
  data: OnboardingBasics;
  onChange: (next: OnboardingBasics) => void;
}) {
  const set = (patch: Partial<OnboardingBasics>) => onChange({ ...data, ...patch });

  return (
    <OnboardingCard>
      <StepHeader
        icon={<UserRound size={22} aria-hidden />}
        kicker="About you"
        title="A few basics"
        subtitle="Name and school help us personalize PathEd. Everything except your name can wait."
      />

      <div>
        <label className={labelClass} htmlFor="onb-name">
          Full name
        </label>
        <Input
          id="onb-name"
          autoComplete="name"
          placeholder="Your name"
          value={data.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="onb-institute">
            Institute
          </label>
          <Input
            id="onb-institute"
            placeholder="College or university"
            value={data.institute}
            onChange={(e) => set({ institute: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="onb-location">
            Location
          </label>
          <Input
            id="onb-location"
            autoComplete="address-level2"
            placeholder="City"
            value={data.location}
            onChange={(e) => set({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="onb-degree">
            Degree
          </label>
          <Select
            id="onb-degree"
            value={data.degree}
            onChange={(e) => set({ degree: e.target.value })}
          >
            <option value="">Select…</option>
            {DEGREES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className={labelClass} htmlFor="onb-branch">
            Branch
          </label>
          <Select
            id="onb-branch"
            value={data.branch}
            onChange={(e) => set({ branch: e.target.value })}
          >
            <option value="">Select…</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className={labelClass} htmlFor="onb-year">
            Grad year
          </label>
          <Select
            id="onb-year"
            value={data.gradYear}
            onChange={(e) => set({ gradYear: e.target.value })}
          >
            <option value="">Select…</option>
            {gradYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </OnboardingCard>
  );
}
