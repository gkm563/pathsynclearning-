"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-main)]">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/onboarding/stage1"
      />
      <div id="clerk-captcha" />
      <p className="font-sans text-sm text-[var(--text-muted)]">Completing sign-in…</p>
    </div>
  );
}
