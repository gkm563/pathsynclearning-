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
import { PROFILE_COLS, sectionCard } from "./shared";

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
  const initials =
    profile.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "PE";

  return (
    <header style={{ ...sectionCard, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          height: 88,
          background:
            "linear-gradient(120deg, rgba(108,99,255,0.18), rgba(0,201,167,0.12))",
          borderBottom: "1px solid var(--border-light)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "flex-end",
          padding: "0 24px 24px",
          marginTop: -36,
        }}
      >
        <button
          type="button"
          onClick={() => onJump("photo")}
          aria-label="Change profile photo"
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            border: "3px solid var(--bg-card)",
            background: profile.imageUrl
              ? `center/cover url(${profile.imageUrl})`
              : "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: "#fff",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {!profile.imageUrl ? initials : null}
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: -4,
              bottom: -4,
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PROFILE_COLS.primary,
            }}
          >
            <Camera size={14} />
          </span>
        </button>

        <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: "Outfit, sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--text-main)",
              }}
            >
              {profile.fullName || "Your profile"}
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(0,201,167,0.12)",
                color: PROFILE_COLS.success,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Outfit, sans-serif",
                textTransform: "capitalize",
              }}
            >
              <CheckCircle2 size={13} />
              {profile.accountStatus || "active"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 16px",
              marginTop: 8,
              color: "var(--text-muted)",
              fontSize: 13.5,
            }}
          >
            {profile.username ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <UserRound size={14} /> @{profile.username}
              </span>
            ) : null}
            {profile.email ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Mail size={14} /> {profile.email}
              </span>
            ) : null}
            {profile.location ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> {profile.location}
              </span>
            ) : null}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Shield size={14} /> {profile.role}
            </span>
          </div>
          {profile.bio ? (
            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 640,
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--text-muted)",
              }}
            >
              {profile.bio}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            if (editing) onCancel?.();
            else onEdit();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            borderRadius: 12,
            border: editing ? "1.5px solid var(--border-light)" : "none",
            background: editing
              ? "var(--bg-alt)"
              : "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: editing ? "var(--text-main)" : "#fff",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 750,
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 4,
          }}
        >
          <Pencil size={15} />
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    </header>
  );
}
