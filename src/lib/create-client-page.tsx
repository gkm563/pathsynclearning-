"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

type Options = {
  /** Default true for marketing/SEO. Portal views can opt out when needed. */
  ssr?: boolean;
};

/** Thin App Router page wrapper for heavy client views. */
export function createClientPage(
  loader: () => Promise<{ default: ComponentType }>,
  options: Options = { ssr: true },
) {
  const Page = dynamic(loader, {
    ssr: options.ssr !== false,
    loading: () => <div className="min-h-screen bg-[var(--bg-main)]" />,
  });

  return function RoutePage() {
    return <Page />;
  };
}
