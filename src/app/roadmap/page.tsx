"use client";

import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/views/Platform/PlatformSkillRoadmap"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[var(--bg-main)]" />,
});

export default function RoutePage() {
  return <Page />;
}
