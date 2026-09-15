"use client";

import { Button, ErrorState, PageHeader, PageSkeleton } from "@/components/ui";
import { CareerSection } from "@/components/profile/CareerSection";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { PreferencesSection } from "@/components/profile/PreferencesSection";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { ProfileSectionNav } from "@/components/profile/ProfileSectionNav";
import { SaveBar } from "@/components/profile/SaveBar";
import { SecuritySection } from "@/components/profile/SecuritySection";
import { profileSection } from "@/components/profile/types";
import { useProfileEditor } from "@/components/profile/useProfileEditor";

/** Account management — `/profile` */
export default function PlatformProfile() {
  const editor = useProfileEditor();
  const meta = profileSection(editor.section);

  if (editor.loading) {
    return <PageSkeleton variant="list" stats={false} />;
  }

  if (editor.loadError) {
    return (
      <ErrorState
        title="Unable to load your profile"
        description="We couldn't reach your account details. Try again, and if it keeps failing refresh the page."
        detail={editor.loadError}
        action={
          <Button variant="secondary" onClick={() => void editor.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description={meta.description}
      />

      <ProfileIdentityCard
        profile={editor.draftProfile}
        editing={editor.editing}
        onEdit={() => {
          editor.startEditing();
          editor.setSection("personal");
        }}
        onCancel={editor.discard}
        onJump={editor.setSection}
      />

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <ProfileSectionNav
          section={editor.section}
          onSelect={editor.setSection}
        />

        <div className="flex min-w-0 flex-col gap-4">
          {editor.section === "overview" ? (
            <ProfileOverview
              profile={editor.draftProfile}
              prefs={editor.draftPrefs}
              onJump={editor.setSection}
            />
          ) : null}

          {editor.section === "personal" ? (
            <PersonalInfoForm
              draft={editor.draftProfile}
              errors={editor.fieldErrors}
              disabled={!editor.editing}
              onChange={editor.updateProfile}
              onRequestEdit={editor.startEditing}
            />
          ) : null}

          {editor.section === "career" ? (
            <CareerSection
              targetRole={editor.draftProfile.targetRole}
              careerGoal={editor.draftProfile.careerGoal}
              cri={editor.draftProfile.cri}
              onApplied={editor.setCareer}
            />
          ) : null}

          {editor.section === "photo" ? (
            <ProfilePhotoSection
              imageUrl={editor.draftProfile.imageUrl}
              fullName={editor.draftProfile.fullName}
              onSynced={editor.setImageUrl}
            />
          ) : null}

          {editor.section === "security" ? <SecuritySection /> : null}

          {editor.section === "preferences" ? (
            <PreferencesSection
              draft={editor.draftPrefs}
              disabled={!editor.editing}
              onChange={editor.updatePrefs}
              onRequestEdit={editor.startEditing}
            />
          ) : null}

          <SaveBar
            dirty={editor.dirty}
            saving={editor.saving}
            status={editor.saveStatus}
            onSave={() => void editor.save()}
            onDiscard={editor.discard}
          />
        </div>
      </div>
    </div>
  );
}
