import { Suspense } from "react";
import { createClientPage } from "@/lib/create-client-page";
import { PageSkeleton } from "@/components/ui";

const ProfilePage = createClientPage(
  () => import("@/views/Platform/PlatformProfile"),
  { skeleton: "list", stats: false },
);

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton variant="list" stats={false} />}>
      <ProfilePage />
    </Suspense>
  );
}
