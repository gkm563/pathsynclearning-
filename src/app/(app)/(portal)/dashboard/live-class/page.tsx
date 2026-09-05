"use client";

import { createClientOnlyPage } from "@/lib/create-client-only-page";

export default createClientOnlyPage(
  () => import("@/views/Platform/PlatformLiveClass"),
);
