import { createClientPage } from "@/lib/create-client-page";

/** Standalone roadmap personalization page for existing users. */
export default createClientPage(
  () => import("@/views/RoadmapOnboarding/RoadmapOnboarding"),
);
