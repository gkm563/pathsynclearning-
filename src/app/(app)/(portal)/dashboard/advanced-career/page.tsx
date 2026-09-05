import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function AdvancedCareerPage() {
  redirect(`${routes.app.dashboard}?feature=advanced-career`);
}
