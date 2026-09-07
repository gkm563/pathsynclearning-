"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthStatusScreen } from "@/components/auth/AuthStatusScreen";
import { resolvePostAuthPath } from "@/lib/auth-routing";
import { routes } from "@/lib/routes";

const RELOAD_KEY = "pathed:auth-continue-reloads";

/**
 * Shown when the Server Component did not see a Clerk session yet
 * (common right after OAuth). Prefer client routing over reload loops.
 */
export default function ContinuePending({ role }: { role: string }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [message, setMessage] = useState("Finishing sign-in…");
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    let cancelled = false;

    const failToLogin = (msg: string) => {
      if (cancelled) return;
      setMessage(msg);
      window.setTimeout(() => {
        window.location.replace(routes.auth.signIn);
      }, 600);
    };

    const go = async (path: string) => {
      if (cancelled) return;
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        // ignore
      }
      window.location.replace(path);
    };

    (async () => {
      // Fast path: Clerk client already has a session — resolve destination here.
      if (isSignedIn) {
        try {
          setMessage("Syncing your account…");
          const path = await resolvePostAuthPath(role);
          await go(path);
          return;
        } catch {
          await go(
            role === "student" ? routes.app.dashboard : routes.home,
          );
          return;
        }
      }

      // Slow path: wait briefly for session cookies / token, then one reload max.
      let attempts = 0;
      const maxAttempts = 20; // ~10s

      while (!cancelled && attempts < maxAttempts) {
        attempts += 1;
        try {
          const token = await getToken();
          if (token) {
            let reloads = 0;
            try {
              reloads = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
            } catch {
              reloads = 0;
            }

            if (reloads < 1) {
              try {
                sessionStorage.setItem(RELOAD_KEY, String(reloads + 1));
              } catch {
                // ignore
              }
              // One server reload so cookies are visible to RSC.
              const q = role ? `?role=${encodeURIComponent(role)}` : "";
              window.location.replace(`${routes.auth.continue}${q}`);
              return;
            }

            // Already reloaded once — do not loop; route on the client.
            setMessage("Syncing your account…");
            try {
              const path = await resolvePostAuthPath(role);
              await go(path);
            } catch {
              await go(
                role === "student" ? routes.app.dashboard : routes.home,
              );
            }
            return;
          }
        } catch {
          // keep polling
        }

        await new Promise((r) => window.setTimeout(r, 500));
      }

      failToLogin("Could not establish a session. Returning to sign in…");
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, role]);

  return <AuthStatusScreen message={message} />;
}
