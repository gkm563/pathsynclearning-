"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRoundPlus } from "lucide-react";
import {
  Button,
  CardGridSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Segmented,
  Skeleton,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { usePlan } from "@/hooks/useStudentData";
import { routes } from "@/lib/routes";
import { ActiveMentorCard } from "./mentorship/ActiveMentorCard";
import { BookingDialog } from "./mentorship/BookingDialog";
import { InstructorPortal } from "./mentorship/InstructorPortal";
import { MentorBrowser } from "./mentorship/MentorBrowser";
import { MentorProfileDialog } from "./mentorship/MentorProfileDialog";
import { MENTORS } from "./mentorship/data";
import type { Mentor, MentorshipTab } from "./mentorship/types";
import { useMentorDirectory } from "./mentorship/useMentorDirectory";

/** Industry mentorship — `/dashboard/mentorship` */
export default function PlatformMentorship() {
  const router = useRouter();
  const toast = useToast();
  const { plan, setPlan, ready } = usePlan();
  const directory = useMentorDirectory();

  const [tab, setTab] = useState<MentorshipTab>("my-mentors");
  const [profileMentor, setProfileMentor] = useState<Mentor | null>(null);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Mentor | null>(null);

  const isPremium = plan === "premium";
  const loading = !ready || directory.status === "loading";
  const goToStore = () => router.push(routes.app.store);

  const addMentor = (id: string) => {
    directory.addMentor(id);
    const mentor = directory.mentors.find((item) => item.id === id);
    setProfileMentor(null);
    toast.success({
      title: `${mentor?.name ?? "Mentor"} added`,
      description: "They now appear under your active mentors.",
      action: { label: "View", onClick: () => setTab("my-mentors") },
    });
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    directory.removeMentor(pendingRemoval.id);
    toast.info(`${pendingRemoval.name} removed from your mentors.`);
    setPendingRemoval(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Collaboration & communities"
        title="Industry mentorship"
        description="Work with senior practitioners to review your portfolio, close syllabus gaps and run mock technical interviews."
        actions={
          <div className="flex items-center gap-2">
            <span className="type-caption text-faint">Preview plan</span>
            <Segmented
              items={[
                { id: "free", label: "Free" },
                { id: "premium", label: "Premium" },
              ]}
              value={isPremium ? "premium" : "free"}
              onChange={(next) => void setPlan(next)}
              ariaLabel="Preview plan"
            />
          </div>
        }
      />

      <Tabs<MentorshipTab>
        items={[
          {
            id: "my-mentors",
            label: "My mentors",
            badge: directory.activeIds.length,
          },
          { id: "browse", label: "Browse", badge: MENTORS.length },
          { id: "instructor", label: "Instructor portal" },
        ]}
        value={tab}
        onChange={setTab}
        ariaLabel="Mentorship sections"
        className="mb-6"
      />

      {directory.status === "error" ? (
        <ErrorState
          title="Couldn't load the mentor directory"
          description="The mentor list didn't come back. Retry, and if it keeps failing the directory is temporarily unavailable."
          detail={directory.error}
          action={
            <Button variant="secondary" onClick={directory.retry}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <TabPanel active={tab === "my-mentors"}>
            {loading ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            ) : directory.activeMentors.length === 0 ? (
              <EmptyState
                icon={<UserRoundPlus size={20} aria-hidden />}
                title="No mentors yet"
                description="Add a mentor to unlock live classes, portfolio reviews and 1-on-1 sessions. Nothing is scheduled until you pick someone."
                action={
                  <Button onClick={() => setTab("browse")}>
                    <Search size={15} aria-hidden />
                    Browse mentors
                  </Button>
                }
              />
            ) : (
              <ul className="flex list-none flex-col gap-5 p-0">
                {directory.activeMentors.map((mentor) => (
                  <li key={mentor.id} className="min-w-0">
                    <ActiveMentorCard
                      mentor={mentor}
                      isPremium={isPremium}
                      onBook={setBookingMentor}
                      onRemove={setPendingRemoval}
                      onUpgrade={goToStore}
                      onJoinSession={(target, topic) =>
                        router.push(
                          `${routes.app.liveClass}?teacher=${target.id}&topic=${encodeURIComponent(topic)}`,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          <TabPanel active={tab === "browse"}>
            {loading ? (
              <CardGridSkeleton count={6} withMedia />
            ) : (
              <MentorBrowser
                mentors={directory.mentors}
                activeIds={directory.activeIds}
                onAdd={addMentor}
                onOpenProfile={setProfileMentor}
              />
            )}
          </TabPanel>

          <TabPanel active={tab === "instructor"}>
            <InstructorPortal />
          </TabPanel>
        </>
      )}

      <MentorProfileDialog
        mentor={profileMentor}
        added={
          profileMentor !== null &&
          directory.activeIds.includes(profileMentor.id)
        }
        onClose={() => setProfileMentor(null)}
        onAdd={addMentor}
      />

      <BookingDialog
        mentor={bookingMentor}
        onClose={() => setBookingMentor(null)}
      />

      <ConfirmDialog
        open={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
        tone="danger"
        title="Remove this mentor?"
        confirmLabel="Remove mentor"
        description={
          pendingRemoval
            ? `${pendingRemoval.name} will be removed from your active mentors. Booked sessions are unaffected and you can add them back at any time.`
            : undefined
        }
      />
    </>
  );
}
