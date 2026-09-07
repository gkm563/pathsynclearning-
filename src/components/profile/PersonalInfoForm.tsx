"use client";

import { Pencil } from "lucide-react";
import type { ProfileFormState } from "@/lib/profile/types";
import {
  Alert,
  Button,
  Card,
  FieldGroup,
  FormField,
  Input,
  Textarea,
} from "@/components/ui";
import type { ProfileFieldErrors } from "./types";

type FieldKey = keyof ProfileFormState;

type FieldSpec = {
  key: FieldKey;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  optional?: boolean;
  /** Managed elsewhere (e.g. by the auth provider), so never editable here. */
  locked?: boolean;
};

const BASICS: FieldSpec[] = [
  { key: "fullName", label: "Full name", required: true, autoComplete: "name" },
  {
    key: "username",
    label: "Username",
    hint: "At least 3 characters — letters, numbers and underscores only.",
    autoComplete: "username",
    optional: true,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    hint: "Managed by your sign-in provider. Contact support to change it.",
    locked: true,
  },
  {
    key: "phone",
    label: "Phone number",
    type: "tel",
    autoComplete: "tel",
    optional: true,
  },
  { key: "dateOfBirth", label: "Date of birth", type: "date", optional: true },
  {
    key: "location",
    label: "Location",
    autoComplete: "address-level2",
    optional: true,
  },
];

const LINKS: FieldSpec[] = [
  { key: "website", label: "Website", placeholder: "https://", optional: true },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/…",
    optional: true,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/…",
    optional: true,
  },
  {
    key: "portfolio",
    label: "Portfolio",
    placeholder: "https://",
    optional: true,
  },
];

const ACADEMIC: FieldSpec[] = [
  { key: "institute", label: "Institute", optional: true },
  { key: "degree", label: "Degree", optional: true },
  { key: "branch", label: "Branch", optional: true },
  { key: "gradYear", label: "Graduation year", optional: true },
];

type RowProps = {
  spec: FieldSpec;
  draft: ProfileFormState;
  errors: ProfileFieldErrors;
  disabled?: boolean;
  onChange: <K extends FieldKey>(key: K, value: ProfileFormState[K]) => void;
};

function TextRow({ spec, draft, errors, disabled, onChange }: RowProps) {
  return (
    <FormField
      label={spec.label}
      hint={spec.hint}
      error={errors[spec.key]}
      required={spec.required}
      optional={spec.optional}
      className="min-w-0"
    >
      {(a) => (
        <Input
          {...a}
          data-profile-field={spec.key}
          type={spec.type ?? "text"}
          value={draft[spec.key]}
          placeholder={spec.placeholder}
          autoComplete={spec.autoComplete}
          disabled={disabled || spec.locked}
          onChange={(e) => onChange(spec.key, e.target.value)}
        />
      )}
    </FormField>
  );
}

function Grid({
  specs,
  ...rest
}: Omit<RowProps, "spec"> & { specs: FieldSpec[] }) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {specs.map((spec) => (
        <TextRow key={spec.key} spec={spec} {...rest} />
      ))}
    </div>
  );
}

/**
 * Every editable profile detail, grouped into fieldsets. Single column on
 * phones, two columns from `md`.
 */
export function PersonalInfoForm({
  draft,
  errors,
  disabled,
  onChange,
  onRequestEdit,
}: {
  draft: ProfileFormState;
  errors: ProfileFieldErrors;
  disabled?: boolean;
  onChange: <K extends FieldKey>(key: K, value: ProfileFormState[K]) => void;
  onRequestEdit: () => void;
}) {
  const rowProps = { draft, errors, disabled, onChange };

  return (
    <section id="personal" className="flex flex-col gap-4">
      {disabled ? (
        <Alert tone="info" title="You're viewing your details">
          <div className="flex flex-wrap items-center gap-3">
            <span>Switch to editing to change any of these fields.</span>
            <Button size="sm" className="min-h-11" onClick={onRequestEdit}>
              <Pencil size={14} aria-hidden />
              Edit profile
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card>
        <FieldGroup
          legend="Basics"
          description="These details appear across PathEd."
        >
          <Grid specs={BASICS} {...rowProps} />

          <FormField
            label="Bio / about"
            hint={`${draft.bio.length}/500 characters`}
            error={errors.bio}
            optional
            className="min-w-0"
          >
            {(a) => (
              <Textarea
                {...a}
                data-profile-field="bio"
                value={draft.bio}
                maxLength={500}
                disabled={disabled}
                placeholder="A couple of lines about what you're building or aiming for."
                onChange={(e) => onChange("bio", e.target.value)}
              />
            )}
          </FormField>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup
          legend="Links"
          description="Website and social profiles shown on your public presence."
        >
          <Grid specs={LINKS} {...rowProps} />
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup
          legend="Academic"
          description="Used for ranking, campus context and recruiter matching."
        >
          <Grid specs={ACADEMIC} {...rowProps} />
        </FieldGroup>
      </Card>
    </section>
  );
}
