"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

/**
 * Client-only dynamic page (no SSR). Use only when the view depends on
 * browser APIs that break during server render.
 */
export function createClientOnlyPage(
  loader: () => Promise<{ default: ComponentType }>,
) {
  return dynamic(loader, {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[var(--bg-main)]" aria-busy="true" />
    ),
  });
}
