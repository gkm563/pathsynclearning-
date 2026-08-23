import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function AdvancedCareerPage() {
  // Currently advanced-career is just a placeholder/locked feature
  // We can redirect them back to dashboard with a query parameter
  // so the LockedFeatureModal can appear, OR just show a simple coming soon page.
  redirect(`${routes.app.dashboard}?feature=advanced-career`);
}
