import type { ReactNode } from "react";

export default function PortalLoading(): ReactNode {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
    </div>
  );
}
