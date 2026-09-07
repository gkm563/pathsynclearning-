import { Image as ImageIcon, Lock, Settings2, User, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ApiClientError } from "@/lib/api";
import {
  EMPTY_PROFILE,
  type ProfileFormState,
  type ProfileSectionId,
} from "@/lib/profile/types";

/**
 * Wire shapes for the account endpoints.
 *
 * These stay in the API's snake_case on purpose — `mapApiProfile` /
 * `mapApiSettings` are the only place the rename to camelCase happens, and
 * renaming earlier would silently break the mappers.
 */

export type ApiProfile = {
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  institute?: string | null;
  degree?: string | null;
  branch?: string | null;
  grad_year?: string | null;
  image_url?: string | null;
  account_status?: string | null;
  role?: string | null;
};

export type ApiSettings = {
  theme?: string | null;
  email_notifications?: boolean | null;
  push_notifications?: boolean | null;
  product_updates?: boolean | null;
  profile_visibility?: string | null;
};

export type ApiSession = {
  id: string;
  status: string;
  last_active_at: string | null;
  expire_at: string | null;
  client_id: string | null;
  is_current: boolean;
};

export type ProfileResponse = { profile: ApiProfile | null };
export type SettingsResponse = { settings: ApiSettings | null };
export type SessionsResponse = {
  sessions: ApiSession[];
  current_session_id?: string | null;
};

export type ProfileFieldErrors = Partial<
  Record<keyof ProfileFormState, string>
>;

export type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

/** Section ids are part of the URL contract (`/profile?section=…`). */
export const PROFILE_SECTIONS: readonly ProfileSection[] = [
  {
    id: "overview",
    label: "Overview",
    description: "A read-only summary of everything on your account.",
    icon: UserRound,
  },
  {
    id: "personal",
    label: "Personal",
    description: "Name, contact details, links and academic record.",
    icon: User,
  },
  {
    id: "photo",
    label: "Photo",
    description: "The avatar shown next to your name across PathEd.",
    icon: ImageIcon,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, signed-in devices and account removal.",
    icon: Lock,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Theme, notification channels and profile visibility.",
    icon: Settings2,
  },
];

export function isProfileSectionId(
  value: string | null | undefined,
): value is ProfileSectionId {
  return PROFILE_SECTIONS.some((s) => s.id === value);
}

export function profileSection(id: ProfileSectionId): ProfileSection {
  return PROFILE_SECTIONS.find((s) => s.id === id) ?? PROFILE_SECTIONS[0];
}

/**
 * Pulls per-field messages out of a 422 `{ code: "VALIDATION", details:
 * { fieldErrors } }` response so a rejected username lands on the username
 * input rather than only in a toast.
 */
export function fieldErrorsFromApi(error: unknown): ProfileFieldErrors {
  if (!(error instanceof ApiClientError)) return {};
  const details = error.details;
  if (!details || typeof details !== "object") return {};
  const fieldErrors = (
    details as { fieldErrors?: Record<string, string[] | undefined> }
  ).fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return {};

  const mapped: ProfileFieldErrors = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    if (key in EMPTY_PROFILE) {
      mapped[key as keyof ProfileFormState] = message;
    }
  }
  return mapped;
}
