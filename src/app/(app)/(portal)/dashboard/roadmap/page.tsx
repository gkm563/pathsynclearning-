"use client";

import { createClientPage } from "@/lib/create-client-page";

export default createClientPage(
  () => import("@/views/Platform/PlatformRoadmap"),
);
