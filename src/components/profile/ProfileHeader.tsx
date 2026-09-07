"use client";

import {
  Camera,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Shield,
  UserRound,
} from "lucide-react";
import type { ProfileFormState, ProfileSectionId } from "@/lib/profile/types";
import { Avatar, Badge, Button, Card } from "@/components/ui";

export function ProfileHeader({
  profile,
  editing,
  onEdit,
  onCancel,
  onJump,
}: {
  profile: ProfileFormState;
  editing: boolean;
  onEdit: () => void;
  onCancel?: () => void;
  onJump: (section: ProfileSectionId) => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="h-[88px] border-b border-line bg-[linear-gradient(120deg,var(--primary-soft),var(--success-soft))]" />
      <div className="-mt-9 flex flex-wrap items-end gap-5 px-6 pb-6">
        <button
          type="button"
          onClick={() => onJump("photo")}
          aria-label="Change profile photo"
          className="relative shrink-0 rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Avatar
            src={profile.imageUrl || null}
            name={profile.fullName || "PathEd student"}
            size="xl"
            className="h-24 w-24 rounded-[var(--radius-lg)] border-[3px] border-surface shadow-[var(--shadow-md)]"
          />
          <span
            aria-hidden
            className="absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-line bg-surface text-primary"
          >
            <Camera size={14} />
          </span>
        </button>

        <div className="min-w-[12.5rem] flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="type-h2 m-0 text-ink">
              {profile.fullName || "Your profile"}
            </h1>
            <Badge tone="success">
              <CheckCircle2 size={13} aria-hidden />
              {profile.accountStatus || "active"}
            </Badge>
          </div>
          <div className="type-small mt-2 flex flex-wrap gap-x-4 gap-y-2 text-muted">
            {profile.username ? (
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={14} aria-hidden /> @{profile.username}
              </span>
            ) : null}
            {profile.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={14} aria-hidden /> {profile.email}
              </span>
            ) : null}
            {profile.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} aria-hidden /> {profile.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} aria-hidden /> {profile.role}
            </span>
          </div>
          {profile.bio ? (
            <p className="type-small mt-2.5 mb-0 max-w-xl text-muted">
              {profile.bio}
            </p>
          ) : null}
        </div>

        <Button
          variant={editing ? "secondary" : "primary"}
          className="mb-1"
          onClick={() => {
            if (editing) onCancel?.();
            else onEdit();
          }}
        >
          <Pencil size={15} aria-hidden />
          {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>
    </Card>
  );
}
