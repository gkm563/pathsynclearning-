"use client";

import { createClientPage } from "@/lib/create-client-page";

/** Canonical Clerk sign-up URL — PathEd custom Register UI (not Account Portal). */
export default createClientPage(() => import("@/views/Register"));
