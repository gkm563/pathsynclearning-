"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useClerk, useSignIn, useSignUp, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { AuthStatusScreen } from "@/components/auth/AuthStatusScreen";
import { authContinueWithRole, routes } from "@/lib/routes";

/**
 * Custom OAuth callback (Clerk Core 3).
 * Do NOT use <AuthenticateWithRedirectCallback /> here — without explicit
 * signInUrl props it sends incomplete flows to *.accounts.dev.
 */
function SSOCallbackContent() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";
  const hasRun = useRef(false);
  const [message, setMessage] = useState("Completing sign-in…");

  const goContinue = () => {
    window.location.replace(authContinueWithRole(role));
  };

  const goSignIn = () => {
    window.location.replace(routes.auth.signIn);
  };

  useEffect(() => {
    if (!isSignedIn) return;
    fetch(routes.api.me, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).catch(() => {});
  }, [isSignedIn, role]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      try {
        const finalizeSignIn = async () => {
          if (!signIn) return goContinue();
          await signIn.finalize({
            navigate: async () => {
              if (!cancelled) goContinue();
            },
          });
        };

        const finalizeSignUp = async () => {
          if (!signUp) return goContinue();
          await signUp.finalize({
            navigate: async () => {
              if (!cancelled) goContinue();
            },
          });
        };

        // Already complete sign-in
        if (signIn?.status === "complete") {
          await finalizeSignIn();
          return;
        }

        // Sign-up transferred to existing account → sign-in
        if (signUp?.isTransferable) {
          await signIn?.create({ transfer: true });
          const signInStatus = signIn?.status as string | undefined;
          if (signInStatus === "complete") {
            await finalizeSignIn();
            return;
          }
          return goSignIn();
        }

        // Sign-in needs non-SSO first factor → back to our sign-in UI
        if (
          signIn?.status === "needs_first_factor" &&
          !signIn.supportedFirstFactors?.every(
            (f) => f.strategy === "enterprise_sso",
          )
        ) {
          return goSignIn();
        }

        // OAuth account not linked yet → create sign-up via transfer
        if (signIn?.isTransferable) {
          await signUp?.create({ transfer: true });
          let signUpStatus = signUp?.status as string | undefined;
          if (signUpStatus === "complete") {
            await finalizeSignUp();
            return;
          }
          // Missing requirements (name, legal, etc.) — continue on our app
          if (signUpStatus === "missing_requirements" && signUp) {
            setMessage("Finishing account setup…");
            try {
              await signUp.update({ legalAccepted: true });
            } catch {
              // legal may already be accepted / not required
            }
            signUpStatus = signUp.status as string;
            if (signUpStatus === "complete") {
              await finalizeSignUp();
              return;
            }
          }
          return goContinue();
        }

        if (signUp?.status === "complete") {
          await finalizeSignUp();
          return;
        }

        if (
          signIn?.status === "needs_second_factor" ||
          signIn?.status === "needs_new_password"
        ) {
          return goSignIn();
        }

        // Existing session on this client
        const sessionId =
          signIn?.existingSession?.sessionId ||
          signUp?.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: async () => {
              if (!cancelled) goContinue();
            },
          });
          return;
        }

        // Session already active from OAuth (no pending SignIn/SignUp)
        if (isSignedIn) {
          goContinue();
          return;
        }

        // Fallback: stay on app
        goContinue();
      } catch (err) {
        console.error("SSO callback failed:", err);
        if (!cancelled) {
          setMessage("Sign-in failed. Returning to sign in…");
          window.setTimeout(goSignIn, 800);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally run once when Clerk + signIn/signUp are ready
  }, [clerk.loaded]);

  return (
    <AuthStatusScreen message={message}>
      {/* Clerk bot protection can mount here during a transfer — keep it visible. */}
      <div id="clerk-captcha" className="empty:hidden" />
    </AuthStatusScreen>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<AuthStatusScreen message="Completing sign-in…" />}>
      <SSOCallbackContent />
    </Suspense>
  );
}
