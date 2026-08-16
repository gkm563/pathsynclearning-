import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** Bare /onboarding → first stage (auth/continue uses stage-aware paths). */
export default function OnboardingIndex() {
  redirect(routes.onboarding.stage1);
}
