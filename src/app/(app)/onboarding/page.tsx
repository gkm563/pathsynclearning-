import { createClientPage } from "@/lib/create-client-page";

/** Optional post-signup setup — `/onboarding` */
export default createClientPage(
  () => import("@/views/AccountOnboarding/AccountOnboarding"),
  { skeleton: "list", stats: false },
);
