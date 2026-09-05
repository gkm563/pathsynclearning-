import { Suspense } from "react";
import { createClientPage } from "@/lib/create-client-page";
import { ProfileSkeleton } from "@/components/profile";

const ProfilePage = createClientPage(
  () => import("@/views/Platform/PlatformProfile"),
);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 4px 40px" }}>
          <ProfileSkeleton />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
