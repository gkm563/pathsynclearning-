import type { ComponentType } from "react";
import dynamic from "next/dynamic";

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]" aria-busy="true" />
  );
}

/**
 * App Router page helper: keep the route module a Server Component while
 * code-splitting a heavy Client view. Do not add `"use client"` to pages
 * that only call this helper.
 */
export function createClientPage(
  loader: () => Promise<{ default: ComponentType }>,
) {
  return dynamic(loader, {
    loading: RouteFallback,
  });
}
