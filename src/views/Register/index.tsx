"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { AuthDivider, AuthProgress, AuthShell } from "@/components/auth/AuthShell";
import {
  AuthAlert,
  AuthField,
  AuthTextLink,
  CodeField,
  PasswordField,
} from "@/components/auth/fields";
import { OAuthButtons, type OAuthStrategy } from "@/components/auth/OAuthButtons";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { findAuthRole, type AuthRoleId } from "@/components/auth/roles";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui/forms";
import {
  authContinueAbsoluteUrl,
  ssoCallbackAbsoluteUrl,
} from "@/lib/auth-urls";
import { authContinueWithRole, routes } from "@/lib/routes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isLoaded, isSignedIn } = useAuth();

  const [role, setRole] = useState<AuthRoleId>("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const isBusy = loading || fetchStatus === "fetching";
  const activeRole = findAuthRole(role);

  const validateForm = (currentForm = form, currentTerms = terms) => {
    if (!currentForm.name.trim()) {
      return "Full Name is required.";
    }
    if (/^\d+$/.test(currentForm.name.trim())) {
      return "Full Name cannot contain numbers only.";
    }
    if (currentForm.name.trim().length < 2) {
      return "Full Name must be at least 2 characters long.";
    }

    if (!currentForm.email.trim()) {
      return "Email address is required.";
    }
    if (!EMAIL_PATTERN.test(currentForm.email.trim())) {
      return "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!currentForm.password) {
      return "Password is required.";
    }
    if (currentForm.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (currentForm.password !== currentForm.confirm) {
      return "Passwords do not match. Please re-enter.";
    }

    if (!currentTerms) {
      return "You must agree to the Terms of Service & Privacy Policy.";
    }

    return "";
  };

  const markLocalSession = async () => {
    try {
      await fetch(routes.api.me, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch {
      // DB sync is best-effort; Clerk session is source of truth
    }
  };

  const clerkErrorMessage = (fallback = "Sign up failed. Please try again.") => {
    return (
      errors?.fields?.emailAddress?.message ||
      errors?.fields?.password?.message ||
      errors?.fields?.firstName?.message ||
      errors?.fields?.code?.message ||
      errors?.global?.[0]?.message ||
      fallback
    );
  };

  /** Activate session then hand off to /auth/continue (single post-auth router). */
  const completeSignUp = async () => {
    setLoading(true);
    setProgress(100);
    try {
      await signUp.finalize({
        navigate: async () => {
          await markLocalSession();
          // Always stay on PathEd — never follow Account Portal (accounts.dev) URLs.
          window.location.replace(authContinueWithRole(role));
        },
      });
    } catch (err) {
      setErrorMessage(
        readError(err) ||
          "Account created, but session setup failed. Please sign in.",
      );
      setLoading(false);
      setProgress(0);
      setPendingVerification(false);
      router.push(routes.auth.signIn);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setErrorMessage(errorMsg);
      return;
    }
    if (!isLoaded || !signUp) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }

    setErrorMessage("");
    // Do NOT cover the form with a blocking overlay here — Clerk bot
    // protection needs a visible #clerk-captcha widget during password().
    setLoading(false);
    setProgress(15);

    try {
      const nameParts = form.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      const { error } = await signUp.password({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName,
        lastName,
      });
      setProgress(45);

      if (error) {
        setErrorMessage(error.message || clerkErrorMessage());
        setProgress(0);
        return;
      }

      if (signUp.isTransferable) {
        setErrorMessage(
          "An account with this email already exists. Please sign in instead.",
        );
        setProgress(0);
        return;
      }

      const { error: updateErr } = await signUp.update({
        unsafeMetadata: { role },
        legalAccepted: true,
      });
      if (updateErr) {
        // Legal acceptance may be optional depending on Clerk instance config
        console.warn("signUp.update:", updateErr.message);
      }

      if (signUp.status === "complete") {
        await completeSignUp();
        return;
      }

      setProgress(70);
      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      setProgress(90);
      if (sendErr) {
        setErrorMessage(sendErr.message || "Could not send verification email.");
        setProgress(0);
        return;
      }

      setPendingVerification(true);
      setProgress(0);
    } catch (err) {
      setErrorMessage(readError(err) || clerkErrorMessage());
      setProgress(0);
    }
  };

  const handleVerifyEmail = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!verifyCode.trim()) {
      setErrorMessage("Enter the verification code from your email.");
      return;
    }
    if (!isLoaded || !signUp) return;

    setErrorMessage("");
    setLoading(true);
    setProgress(40);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: verifyCode.trim(),
      });
      setProgress(80);
      if (error) {
        setErrorMessage(
          error.message || clerkErrorMessage("Invalid verification code."),
        );
        setLoading(false);
        setProgress(0);
        return;
      }
      if (signUp.status === "complete") {
        await completeSignUp();
        return;
      }
      setErrorMessage(
        clerkErrorMessage(
          `Verification incomplete (${signUp.status || "unknown"}). Please try again.`,
        ),
      );
      setLoading(false);
      setProgress(0);
    } catch (err) {
      setErrorMessage(readError(err) || "Verification failed.");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleOAuth = async (strategy: OAuthStrategy) => {
    if (!isLoaded || !signUp) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }
    if (isSignedIn) {
      window.location.replace(authContinueWithRole(role));
      return;
    }
    if (!terms) {
      setErrorMessage(
        "You must agree to the Terms of Service & Privacy Policy.",
      );
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setProgress(40);
    try {
      const { error } = await signUp.sso({
        strategy,
        redirectUrl: authContinueAbsoluteUrl(role),
        redirectCallbackUrl: ssoCallbackAbsoluteUrl(role, "register"),
      });
      if (error) {
        const msg = error.message || "";
        if (isAlreadySignedIn(msg)) {
          window.location.replace(authContinueWithRole(role));
          return;
        }
        setErrorMessage(
          msg || `Could not start ${strategy.replace("oauth_", "")} sign-up.`,
        );
        setLoading(false);
        setProgress(0);
      }
    } catch (err) {
      const msg = readError(err);
      if (isAlreadySignedIn(msg)) {
        window.location.replace(authContinueWithRole(role));
        return;
      }
      setErrorMessage(msg || "Social sign-up failed.");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (
    field: "name" | "email" | "password" | "confirm",
    value: string,
  ) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    if (errorMessage) {
      setErrorMessage(validateForm(updatedForm, terms));
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setTerms(checked);
    if (errorMessage) {
      setErrorMessage(validateForm(form, checked));
    }
  };

  const nameInvalid = Boolean(
    errorMessage && (!form.name.trim() || /^\d+$/.test(form.name.trim())),
  );
  const emailInvalid = Boolean(
    errorMessage &&
      (!form.email.trim() || !EMAIL_PATTERN.test(form.email.trim())),
  );
  const passwordInvalid = Boolean(errorMessage && form.password.length < 8);
  const confirmInvalid = Boolean(
    errorMessage && form.password !== form.confirm,
  );

  return (
    <AuthShell
      role={activeRole}
      eyebrow="Create free account"
      heading={<>Start your journey to mastery.</>}
    >
      {pendingVerification ? (
        <section aria-labelledby="verify-heading">
          <h2 id="verify-heading" className="type-h2 m-0 text-ink">
            Check your inbox
          </h2>
          <p className="type-body mt-2 mb-7 text-muted">
            We sent a verification code to{" "}
            <strong className="font-semibold text-ink">{form.email}</strong>.
            Enter it below to finish creating your account.
          </p>

          <AuthProgress value={progress} />
          <AuthAlert message={errorMessage} />

          <form onSubmit={handleVerifyEmail} className="flex flex-col gap-5">
            <CodeField
              label="Verification code"
              value={verifyCode}
              onValueChange={setVerifyCode}
              disabled={isBusy}
            />

            <Button type="submit" size="lg" loading={isBusy} className="w-full">
              {isBusy ? "Verifying…" : "Verify and continue"}
              {isBusy ? null : <ArrowRight size={17} aria-hidden />}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <AuthTextLink
              onClick={async () => {
                setErrorMessage("");
                const { error } = await signUp.verifications.sendEmailCode();
                if (error) {
                  setErrorMessage(error.message || "Could not resend code.");
                }
              }}
            >
              Resend code
            </AuthTextLink>
          </div>
        </section>
      ) : (
        <section aria-labelledby="signup-heading">
          <h2 id="signup-heading" className="type-h2 m-0 text-ink">
            Create your account
          </h2>
          <p className="type-body mt-2 mb-7 text-muted">
            {activeRole.tagline}
          </p>

          <div className="mb-6">
            <RoleSelector
              value={role}
              onChange={(next) => {
                setRole(next);
                setErrorMessage("");
              }}
              disabled={isBusy}
            />
          </div>

          <AuthProgress value={progress} />
          <AuthAlert message={errorMessage} />

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <AuthField
              label="Full name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => handleInputChange("name", event.target.value)}
              placeholder="Alex Morgan"
              invalid={nameInvalid}
              disabled={isBusy}
            />

            <AuthField
              label="Email address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                handleInputChange("email", event.target.value)
              }
              placeholder="you@pathed.org"
              invalid={emailInvalid}
              disabled={isBusy}
            />

            <PasswordField
              label="Password"
              value={form.password}
              onValueChange={(value) => handleInputChange("password", value)}
              autoComplete="new-password"
              invalid={passwordInvalid}
              disabled={isBusy}
              showMeter
            />

            <PasswordField
              label="Confirm password"
              value={form.confirm}
              onValueChange={(value) => handleInputChange("confirm", value)}
              autoComplete="new-password"
              invalid={confirmInvalid}
              disabled={isBusy}
            />

            <Checkbox
              checked={terms}
              onChange={handleTermsChange}
              disabled={isBusy}
              label={
                <>
                  I agree to the{" "}
                  <Link
                    href={routes.marketing.terms}
                    className="font-semibold text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={routes.marketing.privacy}
                    className="font-semibold text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </>
              }
            />

            {/* Clerk bot protection mounts here — must stay visible. */}
            <div id="clerk-captcha" className="min-h-1 empty:hidden" />

            <Button type="submit" size="lg" loading={isBusy} className="w-full">
              {isBusy
                ? "Creating account…"
                : `Create ${activeRole.name} account`}
              {isBusy ? null : <ArrowRight size={17} aria-hidden />}
            </Button>
          </form>

          <AuthDivider label="or sign up with" />
          <OAuthButtons
            verb="Sign up"
            disabled={isBusy}
            onSelect={handleOAuth}
          />
        </section>
      )}

      <p className="type-small mt-8 mb-0 text-center text-muted">
        Already have an account?{" "}
        <Link
          href={routes.auth.signIn}
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

/** Pulls the most specific message out of a thrown Clerk error. */
function readError(err: unknown): string {
  const candidate = err as
    | { errors?: Array<{ message?: string }>; message?: string }
    | undefined;
  return candidate?.errors?.[0]?.message || candidate?.message || "";
}

function isAlreadySignedIn(message: string): boolean {
  return /already signed in|session already exists|already authenticated/i.test(
    message,
  );
}
