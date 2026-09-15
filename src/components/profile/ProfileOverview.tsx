"use client";

import { ArrowRight } from "lucide-react";
import type { PreferencesFormState, ProfileFormState, ProfileSectionId } from "@/lib/profile/types";
import { Button, Card, DescriptionList } from "@/components/ui";
import { StudentRegistrationIdDisplay } from "@/components/profile/StudentRegistrationIdDisplay";

const VISIBILITY_LABEL: Record<PreferencesFormState["profileVisibility"], string> = {
  public: "Public — anyone signed in can find you",
  connections: "Connections only",
  private: "Private — hidden from username lookup",
};

function dash(value: string) {
  return value.trim().length ? value : "Not set";
}

function channels(prefs: PreferencesFormState) {
  const on = [
    prefs.emailNotifications ? "Email" : null,
    prefs.pushNotifications ? "Push" : null,
    prefs.productUpdates ? "Product news" : null,
  ].filter(Boolean);
  return on.length ? on.join(", ") : "All channels off";
}

function OverviewCard({
  title,
  description,
  items,
  cta,
  onJump,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string }>;
  cta: { label: string; section: ProfileSectionId };
  onJump: (section: ProfileSectionId) => void;
}) {
  return (
    <Card className="flex min-w-0 flex-col">
      <h3 className="type-h4 m-0 text-ink">{title}</h3>
      <p className="type-small mt-1 mb-4 text-muted">{description}</p>
      <DescriptionList items={items} className="min-w-0" />
      <div className="mt-5 flex">
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => onJump(cta.section)}
        >
          {cta.label}
          <ArrowRight size={15} aria-hidden />
        </Button>
      </div>
    </Card>
  );
}

/** Read-only digest of the account, with a jump into each editable section. */
export function ProfileOverview({
  profile,
  prefs,
  onJump,
}: {
  profile: ProfileFormState;
  prefs: PreferencesFormState;
  onJump: (section: ProfileSectionId) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {profile.studentRegistrationId ? (
        <div className="xl:col-span-2">
          <StudentRegistrationIdDisplay value={profile.studentRegistrationId} />
        </div>
      ) : null}
      <OverviewCard
        title="Personal details"
        description="How you appear to mentors, recruiters and peers."
        onJump={onJump}
        cta={{ label: "Edit personal details", section: "personal" }}
        items={[
          { label: "Full name", value: dash(profile.fullName) },
          { label: "Username", value: dash(profile.username) },
          { label: "Email", value: dash(profile.email) },
          { label: "Phone", value: dash(profile.phone) },
          { label: "Location", value: dash(profile.location) },
        ]}
      />

      <OverviewCard
        title="Academic record"
        description="Used for campus context and recruiter matching."
        onJump={onJump}
        cta={{ label: "Edit academic record", section: "personal" }}
        items={[
          { label: "Institute", value: dash(profile.institute) },
          { label: "Degree", value: dash(profile.degree) },
          { label: "Branch", value: dash(profile.branch) },
          { label: "Graduation", value: dash(profile.gradYear) },
        ]}
      />

      <OverviewCard
        title="Career"
        description="Target role and Career Readiness Index for this path."
        onJump={onJump}
        cta={{ label: "Change career", section: "career" }}
        items={[
          {
            label: "Career",
            value: dash(profile.targetRole || profile.careerGoal),
          },
          { label: "CRI", value: `${profile.cri}%` },
        ]}
      />

      <OverviewCard
        title="Preferences"
        description="Theme, notification channels and who can find you."
        onJump={onJump}
        cta={{ label: "Edit preferences", section: "preferences" }}
        items={[
          { label: "Companion", value: prefs.copilotName || "Nova" },
          { label: "Theme", value: prefs.theme === "dark" ? "Dark" : "Light" },
          { label: "Notifications", value: channels(prefs) },
          {
            label: "Visibility",
            value: VISIBILITY_LABEL[prefs.profileVisibility],
          },
        ]}
      />

      <OverviewCard
        title="Links"
        description="Shown wherever your public presence appears."
        onJump={onJump}
        cta={{ label: "Edit links", section: "personal" }}
        items={[
          { label: "Website", value: dash(profile.website) },
          { label: "GitHub", value: dash(profile.github) },
          { label: "LinkedIn", value: dash(profile.linkedin) },
          { label: "Portfolio", value: dash(profile.portfolio) },
        ]}
      />
    </div>
  );
}
