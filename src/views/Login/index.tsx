"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
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
import {
  authContinueAbsoluteUrl,
  ssoCallbackAbsoluteUrl,
} from "@/lib/auth-urls";
import { authContinueWithRole, routes } from "@/lib/routes";

const SUPPORT_EMAIL = "hello@pathed.in";

export default function Login() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();

  const [role, setRole] = useState<AuthRoleId>("student");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingClientTrust, setPendingClientTrust] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [showResetHelp, setShowResetHelp] = useState(false);

  const isBusy = loading || fetchStatus === "fetching";
  const activeRole = findAuthRole(role);

  const validateLoginForm = (currentForm = form) => {
    if (!currentForm.identifier.trim()) {
      return "Email or username is required.";
    }
    if (currentForm.identifier.trim().length < 3) {
      return "Email or username must be at least 3 characters.";
    }
    if (!currentForm.password) {
      return "Password is required.";
    }
    if (currentForm.password.length < 8) {
      return "Password must be at least 8 characters long.";
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

  const finishSignIn = async () => {
    setLoading(true);
    setProgress(100);
    await signIn.finalize({
      navigate: async () => {
        await markLocalSession();
        // Always stay on PathEd — never follow Account Portal (accounts.dev) URLs.
        window.location.replace(authContinueWithRole(role));
      },
    });
  };

  const startClientTrust = async () => {
    const factors = signIn.supportedSecondFactors || [];
    const emailCodeFactor = factors.find(
      (f: { strategy: string }) => f.strategy === "email_code",
    );
    if (emailCodeFactor) {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        setErrorMessage(error.message || "Could not send verification code.");
        return false;
      }
      setPendingClientTrust(true);
      setErrorMessage("");
      return true;
    }
    const phoneCodeFactor = factors.find(
      (f: { strategy: string }) => f.strategy === "phone_code",
    );
    if (phoneCodeFactor) {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) {
        setErrorMessage(
          error.message || "Could not send SMS verification code.",
        );
        return false;
      }
      setPendingClientTrust(true);
      setErrorMessage("");
      return true;
    }
    setErrorMessage(
      "Additional device verification is required, but no email/SMS factor is available.",
    );
    return false;
  };

  const clerkErrorMessage = (fallback = "Sign in failed. Please try again.") => {
    return (
      errors?.fields?.identifier?.message ||
      errors?.fields?.password?.message ||
      errors?.fields?.code?.message ||
      errors?.global?.[0]?.message ||
      fallback
    );
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorMsg = validateLoginForm();
    if (errorMsg) {
      setErrorMessage(errorMsg);
      return;
    }
    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }

    setErrorMessage("");
    // Keep captcha visible — no blocking overlay until after password()
    setLoading(false);
    setProgress(25);

    try {
      const identifier = form.identifier.trim();
      const looksLikeEmail = identifier.includes("@");
      const { error } = await signIn.password(
        looksLikeEmail
          ? { emailAddress: identifier, password: form.password }
          : { identifier, password: form.password },
      );
      setProgress(70);

      if (error) {
        setErrorMessage(error.message || clerkErrorMessage());
        setProgress(0);
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      if (
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_second_factor"
      ) {
        await startClientTrust();
        setProgress(0);
        return;
      }

      setErrorMessage(
        clerkErrorMessage(
          `Unable to complete sign in (${signIn.status || "unknown"}).`,
        ),
      );
      setProgress(0);
    } catch (err) {
      setErrorMessage(readError(err) || clerkErrorMessage());
      setProgress(0);
    }
  };

  const handleVerifyClientTrust = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!verifyCode.trim()) {
      setErrorMessage("Enter the verification code from your email.");
      return;
    }
    if (!isLoaded || !signIn) return;

    setErrorMessage("");
    setLoading(true);
    setProgress(40);
    try {
      const factors = signIn.supportedSecondFactors || [];
      const usesPhone =
        factors.some((f: { strategy: string }) => f.strategy === "phone_code") &&
        !factors.some((f: { strategy: string }) => f.strategy === "email_code");
      const { error } = usesPhone
        ? await signIn.mfa.verifyPhoneCode({ code: verifyCode.trim() })
        : await signIn.mfa.verifyEmailCode({ code: verifyCode.trim() });
      setProgress(80);
      if (error) {
        setErrorMessage(
          error.message || clerkErrorMessage("Invalid verification code."),
        );
        setLoading(false);
        setProgress(0);
        return;
      }
      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }
      setErrorMessage(
        clerkErrorMessage("Verification incomplete. Please try again."),
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
    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }
    if (isSignedIn) {
      window.location.replace(authContinueWithRole(role));
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setProgress(40);
    try {
      const { error } = await signIn.sso({
        strategy,
        // Final destination when session is ready (no extra steps)
        redirectUrl: authContinueAbsoluteUrl(role),
        // Intermediate callback when transfer / extra steps are required
        redirectCallbackUrl: ssoCallbackAbsoluteUrl(role, "login"),
      });
      if (error) {
        const msg = error.message || "";
        if (isAlreadySignedIn(msg)) {
          window.location.replace(authContinueWithRole(role));
          return;
        }
        setErrorMessage(
          msg || `Could not start ${strategy.replace("oauth_", "")} sign-in.`,
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
      setErrorMessage(msg || "Social sign-in failed.");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (field: "identifier" | "password", value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    if (errorMessage) {
      setErrorMessage(validateLoginForm(updatedForm));
    }
  };

  const identifierInvalid = Boolean(
    errorMessage &&
      (!form.identifier.trim() || form.identifier.trim().length < 3),
  );
  const passwordInvalid = Boolean(
    errorMessage && (!form.password || form.password.length < 8),
  );

  return (
    <AuthShell
      role={activeRole}
      eyebrow="Welcome back"
      heading={
        <>
          Pick up exactly where you left off.
        </>
      }
    >
      {pendingClientTrust ? (
        <section aria-labelledby="verify-heading">
          <h2 id="verify-heading" className="type-h2 m-0 text-ink">
            Verify this device
          </h2>
          <p className="type-body mt-2 mb-7 text-muted">
            We sent a verification code to your email to confirm this device.
            Enter it below to finish signing in.
          </p>

          <AuthProgress value={progress} />
          <AuthAlert message={errorMessage} />

          <form onSubmit={handleVerifyClientTrust} className="flex flex-col gap-5">
            <CodeField
              label="Verification code"
              value={verifyCode}
              onValueChange={setVerifyCode}
              disabled={isBusy}
            />

            {/* Clerk bot protection mounts here — must stay visible. */}
            <div id="clerk-captcha" className="min-h-1 empty:hidden" />

            <Button type="submit" size="lg" loading={isBusy} className="w-full">
              {isBusy ? "Verifying…" : "Verify and continue"}
              {isBusy ? null : <ArrowRight size={17} aria-hidden />}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <AuthTextLink
              onClick={async () => {
                setErrorMessage("");
                await startClientTrust();
              }}
            >
              Resend code
            </AuthTextLink>
            <button
              type="button"
              onClick={() => {
                signIn?.reset?.();
                setPendingClientTrust(false);
                setVerifyCode("");
                setErrorMessage("");
              }}
              className="type-caption rounded-[var(--radius-xs)] font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Start over
            </button>
          </div>
        </section>
      ) : (
        <section aria-labelledby="signin-heading">
          <h2 id="signin-heading" className="type-h2 m-0 text-ink">
            Sign in to PathEd
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

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <AuthField
              label="Email or username"
              type="text"
              autoComplete="username"
              value={form.identifier}
              onChange={(event) =>
                handleInputChange("identifier", event.target.value)
              }
              placeholder="you@pathed.org"
              invalid={identifierInvalid}
              disabled={isBusy}
            />

            <PasswordField
              label="Password"
              value={form.password}
              onValueChange={(value) => handleInputChange("password", value)}
              autoComplete="current-password"
              invalid={passwordInvalid}
              disabled={isBusy}
              hint={
                <AuthTextLink onClick={() => setShowResetHelp((prev) => !prev)}>
                  Forgot password?
                </AuthTextLink>
              }
            />

            {showResetHelp ? (
              <p className="type-caption m-0 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3 text-muted">
                Self-service password reset isn&apos;t enabled on this
                workspace yet. Email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                from your registered address and we&apos;ll reset it for you.
              </p>
            ) : null}

            {/* Clerk bot protection mounts here — must stay visible. */}
            <div id="clerk-captcha" className="min-h-1 empty:hidden" />

            <Button type="submit" size="lg" loading={isBusy} className="w-full">
              {isBusy ? "Authenticating…" : `Sign in as ${activeRole.name}`}
              {isBusy ? null : <ArrowRight size={17} aria-hidden />}
            </Button>
          </form>

          <AuthDivider label="or continue with" />
          <OAuthButtons
            verb="Sign in"
            disabled={isBusy}
            onSelect={handleOAuth}
          />
        </section>
      )}

      <p className="type-small mt-8 mb-0 text-center text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href={routes.auth.signUp}
          className="font-semibold text-primary hover:underline"
        >
          Create one
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
