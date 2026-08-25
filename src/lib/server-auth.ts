import { redirect } from "next/navigation";
import { requireDbUser, type DbUser } from "@/lib/db/users";
import { routes } from "@/lib/routes";

/** Authenticated student portal — session + student role only. */
export async function requireStudentPortal(): Promise<{ user: DbUser }> {
  let user: DbUser;
  try {
    user = await requireDbUser();
  } catch {
    redirect(routes.auth.signIn);
  }

  if (user.role !== "student") {
    redirect(routes.home);
  }

  return { user };
}
