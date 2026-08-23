import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

/** Auth entry points (login, register, SSO, continue). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
