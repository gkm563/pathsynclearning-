"use client";

import type { ReactNode } from "react";
import { Camera, Mail, MapPin, Pencil, Shield, UserRound, X } from "lucide-react";
import type { ProfileFormState, ProfileSectionId } from "@/lib/profile/types";
import { Avatar, Badge, Button, Card } from "@/components/ui";

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
      <Icon size={14} aria-hidden className="shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

/**
 * Identity summary shown above the section nav on every profile section.
 * The heading is an `h2` — `PageHeader` owns the page's single `h1`.
 */
export function ProfileIdentityCard({
  profile,
  editing,
  onEdit,
  onCancel,
  onJump,
}: {
  profile: ProfileFormState;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onJump: (section: ProfileSectionId) => void;
}) {
  return (
    <Card className="flex min-w-0 flex-col gap-4 overflow-hidden md:flex-row md:items-start md:gap-6">
      <Avatar
        src={profile.imageUrl || null}
        name={profile.fullName || "PathEd student"}
        size="xl"
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="type-h3 m-0 min-w-0 break-words text-ink">
            {profile.fullName || "Your profile"}
          </h2>
          <Badge tone="success">{profile.accountStatus || "active"}</Badge>
        </div>

        <div className="type-small mt-2.5 flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-5">
          {profile.username ? (
            <Meta icon={UserRound}>@{profile.username}</Meta>
          ) : null}
          {profile.email ? <Meta icon={Mail}>{profile.email}</Meta> : null}
          {profile.location ? (
            <Meta icon={MapPin}>{profile.location}</Meta>
          ) : null}
          <Meta icon={Shield}>{profile.role}</Meta>
        </div>

        {profile.bio ? (
          <p className="type-small mt-3 mb-0 max-w-prose text-muted">
            {profile.bio}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap md:w-auto md:shrink-0">
        <Button
          variant="secondary"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => onJump("photo")}
        >
          <Camera size={15} aria-hidden />
          Change photo
        </Button>
        {editing ? (
          <Button
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={onCancel}
          >
            <X size={15} aria-hidden />
            Cancel editing
          </Button>
        ) : (
          <Button className="min-h-11 w-full sm:w-auto" onClick={onEdit}>
            <Pencil size={15} aria-hidden />
            Edit profile
          </Button>
        )}
      </div>
    </Card>
  );
}
