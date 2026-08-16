import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** Legacy /home → canonical marketing home */
export default function HomeRedirect() {
  redirect(routes.home);
}
