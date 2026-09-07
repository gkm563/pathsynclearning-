"use client";

import { useEffect, useId, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  FormField,
  Input,
  Textarea,
  useToast,
} from "@/components/ui";
import { apiSend } from "@/lib/api";
import { applicationKindFor } from "./helpers";
import type {
  ApplicationCreateResponse,
  ApplicationKind,
  Opportunity,
} from "./types";

type FieldName = "fullName" | "email" | "github" | "pitch";
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mirrors what the previous native `type="email"` / `type="url"` / `required`
 * attributes enforced, so the acceptance criteria are unchanged — a GitHub URL
 * is still mandatory. The form is `noValidate` so failures surface as inline,
 * announced field errors instead of a browser bubble.
 */
function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name as it should appear to organisers.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter the email address organisers should reply to.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address, e.g. you@college.edu.";
  }

  if (!values.github.trim()) {
    errors.github =
      "A GitHub profile URL is required so we can sync your contribution score.";
  } else if (!isAbsoluteUrl(values.github.trim())) {
    errors.github =
      "Enter the full URL, including https:// — e.g. https://github.com/your-username.";
  }

  if (!values.pitch.trim()) {
    errors.pitch = "Tell the organisers why you should be selected.";
  }

  return errors;
}

/**
 * The one application flow, shared by `/dashboard/events` and
 * `/dashboard/og-opportunities`.
 *
 * Both pages previously implemented this form twice, identical apart from the
 * `kind` sent to the API — which is derived here from the opportunity id, the
 * same rule both pages used.
 */
export function ApplicationDialog({
  opportunity,
  alreadyApplied,
  onClose,
  onApplied,
  defaultFullName = "Rahul Kushwaha",
  defaultEmail = "rahul.kushwaha.sde@gmail.com",
}: {
  /** `null` closes the dialog; the page owns which opportunity is in flight. */
  opportunity: Opportunity | null;
  alreadyApplied: boolean;
  onClose: () => void;
  onApplied: (id: string, kind: ApplicationKind) => void;
  defaultFullName?: string;
  defaultEmail?: string;
}) {
  const toast = useToast();
  const formId = useId();

  const [fullName, setFullName] = useState(defaultFullName);
  const [email, setEmail] = useState(defaultEmail);
  const [github, setGithub] = useState("");
  const [pitch, setPitch] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const open = opportunity !== null;

  // A newly opened form should never inherit the previous attempt's errors.
  useEffect(() => {
    if (open) setErrors({});
  }, [open, opportunity?.id]);

  const clearError = (field: FieldName) =>
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!opportunity || submitting) return;

    const found = validate({ fullName, email, github, pitch });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const kind = applicationKindFor(opportunity);
    let synced = true;

    if (!alreadyApplied) {
      // Optimistic: the card flips to "Applied" immediately, and the record
      // survives a failed request exactly as it did before.
      onApplied(opportunity.id, kind);
      try {
        await apiSend<ApplicationCreateResponse>(
          "/api/me/applications",
          "POST",
          { eventId: opportunity.id, kind },
        );
      } catch {
        synced = false;
      }
    }

    if (synced) {
      toast.success({
        title: "Application submitted",
        description: `Your spot for “${opportunity.title}” is queued as a secured spot in your dashboard.`,
      });
    } else {
      toast.warning({
        title: "Saved on this device only",
        description: `We couldn’t reach the applications service, so “${opportunity.title}” hasn’t been synced to your profile yet.`,
      });
    }

    setSubmitting(false);
    setGithub("");
    setPitch("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="PathEd OG application"
      description={
        opportunity
          ? `Reviewed directly by ${opportunity.organizer}.`
          : undefined
      }
      size="md"
      dismissible={!submitting}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="min-h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={submitting}
            className="min-h-11"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </>
      }
    >
      {opportunity ? (
        <form
          id={formId}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 pt-1"
        >
          <Alert tone="info" title={opportunity.title}>
            Applying natively — no partner redirect. Organisers review this
            submission directly.
          </Alert>

          <fieldset disabled={submitting} className="min-w-0 border-0 p-0">
            <div className="flex flex-col gap-4">
              <FormField label="Full name" required error={errors.fullName}>
                {(props) => (
                  <Input
                    {...props}
                    data-autofocus
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("fullName");
                    }}
                  />
                )}
              </FormField>

              <FormField label="Email address" required error={errors.email}>
                {(props) => (
                  <Input
                    {...props}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                  />
                )}
              </FormField>

              <FormField
                label="GitHub profile"
                required
                error={errors.github}
                hint="Used to sync your contribution score onto the application."
              >
                {(props) => (
                  <Input
                    {...props}
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://github.com/your-username"
                    value={github}
                    onChange={(e) => {
                      setGithub(e.target.value);
                      clearError("github");
                    }}
                  />
                )}
              </FormField>

              <FormField
                label="Statement of purpose"
                required
                error={errors.pitch}
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={4}
                    placeholder="Why should you be selected? Highlight relevant projects and skills…"
                    value={pitch}
                    onChange={(e) => {
                      setPitch(e.target.value);
                      clearError("pitch");
                    }}
                  />
                )}
              </FormField>
            </div>
          </fieldset>
        </form>
      ) : null}
    </Dialog>
  );
}
