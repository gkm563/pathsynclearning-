"use client";

import { createClientPage } from "@/lib/create-client-page";

/** Canonical Clerk sign-in URL — PathEd custom Login UI (not Account Portal). */
export default createClientPage(() => import("@/views/Login"));
