"use client";

import type { ProfileFormState } from "@/lib/profile/types";
import { SectionHeading, TextAreaField, TextField, sectionCard } from "./shared";

export function PersonalInfoForm({
  draft,
  errors,
  disabled,
  onChange,
}: {
  draft: ProfileFormState;
  errors: Partial<Record<keyof ProfileFormState, string>>;
  disabled?: boolean;
  onChange: <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => void;
}) {
  return (
    <section id="personal" style={sectionCard}>
      <SectionHeading
        title="Personal information"
        description="These details appear across PathEd. Email is managed by your sign-in provider."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <TextField
          id="fullName"
          label="Full name"
          value={draft.fullName}
          disabled={disabled}
          error={errors.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          autoComplete="name"
        />
        <TextField
          id="username"
          label="Username"
          value={draft.username}
          disabled={disabled}
          error={errors.username}
          hint="Letters, numbers, and underscores only"
          onChange={(e) => onChange("username", e.target.value)}
          autoComplete="username"
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={draft.email}
          disabled
          hint="Contact support to change your email"
        />
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          value={draft.phone}
          disabled={disabled}
          error={errors.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          autoComplete="tel"
        />
        <TextField
          id="dateOfBirth"
          label="Date of birth"
          type="date"
          value={draft.dateOfBirth}
          disabled={disabled}
          error={errors.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
        />
        <TextField
          id="location"
          label="Location"
          value={draft.location}
          disabled={disabled}
          error={errors.location}
          onChange={(e) => onChange("location", e.target.value)}
          autoComplete="address-level2"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <TextAreaField
          id="bio"
          label="Bio / about"
          value={draft.bio}
          disabled={disabled}
          error={errors.bio}
          hint={`${draft.bio.length}/500`}
          maxLength={500}
          onChange={(e) => onChange("bio", e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <SectionHeading
          title="Links"
          description="Website and social profiles shown on your public presence."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <TextField
            id="website"
            label="Website"
            value={draft.website}
            disabled={disabled}
            error={errors.website}
            placeholder="https://"
            onChange={(e) => onChange("website", e.target.value)}
          />
          <TextField
            id="github"
            label="GitHub"
            value={draft.github}
            disabled={disabled}
            error={errors.github}
            placeholder="https://github.com/…"
            onChange={(e) => onChange("github", e.target.value)}
          />
          <TextField
            id="linkedin"
            label="LinkedIn"
            value={draft.linkedin}
            disabled={disabled}
            error={errors.linkedin}
            placeholder="https://linkedin.com/in/…"
            onChange={(e) => onChange("linkedin", e.target.value)}
          />
          <TextField
            id="portfolio"
            label="Portfolio"
            value={draft.portfolio}
            disabled={disabled}
            error={errors.portfolio}
            placeholder="https://"
            onChange={(e) => onChange("portfolio", e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <SectionHeading
          title="Academic"
          description="Used for ranking, campus context, and recruiter matching."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <TextField
            id="institute"
            label="Institute"
            value={draft.institute}
            disabled={disabled}
            onChange={(e) => onChange("institute", e.target.value)}
          />
          <TextField
            id="degree"
            label="Degree"
            value={draft.degree}
            disabled={disabled}
            onChange={(e) => onChange("degree", e.target.value)}
          />
          <TextField
            id="branch"
            label="Branch"
            value={draft.branch}
            disabled={disabled}
            onChange={(e) => onChange("branch", e.target.value)}
          />
          <TextField
            id="gradYear"
            label="Graduation year"
            value={draft.gradYear}
            disabled={disabled}
            onChange={(e) => onChange("gradYear", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
