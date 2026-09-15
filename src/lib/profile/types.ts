import {
  DEFAULT_COPILOT_NAME,
  isCopilotMemorySource,
} from "@/lib/ai/copilot-identity";

export type ProfileVisibility = "public" | "private" | "connections";
export type ThemePreference = "light" | "dark";

export type ProfileFormState = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  portfolio: string;
  institute: string;
  degree: string;
  branch: string;
  gradYear: string;
  imageUrl: string;
  accountStatus: string;
  role: string;
  studentRegistrationId: string;
  careerGoal: string;
  targetRole: string;
  cri: number;
};

export type PreferencesFormState = {
  theme: ThemePreference;
  emailNotifications: boolean;
  pushNotifications: boolean;
  productUpdates: boolean;
  profileVisibility: ProfileVisibility;
  copilotName: string;
  copilotMemory: string;
  copilotMemorySource: "" | "chatgpt" | "claude" | "gemini";
};

export type ProfileSession = {
  id: string;
  status: string;
  last_active_at: string | null;
  expire_at: string | null;
  client_id: string | null;
  is_current: boolean;
};

export type ProfileSectionId =
  | "overview"
  | "personal"
  | "career"
  | "photo"
  | "security"
  | "preferences";

export const EMPTY_PROFILE: ProfileFormState = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  bio: "",
  location: "",
  website: "",
  github: "",
  linkedin: "",
  portfolio: "",
  institute: "",
  degree: "",
  branch: "",
  gradYear: "",
  imageUrl: "",
  accountStatus: "active",
  role: "student",
  studentRegistrationId: "",
  careerGoal: "",
  targetRole: "",
  cri: 0,
};

export const EMPTY_PREFERENCES: PreferencesFormState = {
  theme: "light",
  emailNotifications: true,
  pushNotifications: true,
  productUpdates: true,
  profileVisibility: "public",
  copilotName: DEFAULT_COPILOT_NAME,
  copilotMemory: "",
  copilotMemorySource: "",
};

export function mapApiProfile(
  p: Record<string, unknown> | null | undefined,
): ProfileFormState {
  if (!p) return { ...EMPTY_PROFILE };
  return {
    fullName: String(p.full_name ?? ""),
    username: String(p.username ?? ""),
    email: String(p.email ?? ""),
    phone: String(p.phone ?? ""),
    dateOfBirth: String(p.date_of_birth ?? ""),
    bio: String(p.bio ?? ""),
    location: String(p.location ?? ""),
    website: String(p.website ?? ""),
    github: String(p.github ?? ""),
    linkedin: String(p.linkedin ?? ""),
    portfolio: String(p.portfolio ?? ""),
    institute: String(p.institute ?? ""),
    degree: String(p.degree ?? ""),
    branch: String(p.branch ?? ""),
    gradYear: String(p.grad_year ?? ""),
    imageUrl: String(p.image_url ?? ""),
    accountStatus: String(p.account_status ?? "active"),
    role: String(p.role ?? "student"),
    studentRegistrationId: String(p.student_registration_id ?? ""),
    careerGoal: String(p.career_goal ?? ""),
    targetRole: String(p.target_role ?? ""),
    cri: Number(p.cri) || 0,
  };
}

export function mapApiSettings(
  s: Record<string, unknown> | null | undefined,
): PreferencesFormState {
  if (!s) return { ...EMPTY_PREFERENCES };
  const theme = s.theme === "dark" ? "dark" : "light";
  const visibility = (["public", "private", "connections"] as const).includes(
    s.profile_visibility as ProfileVisibility,
  )
    ? (s.profile_visibility as ProfileVisibility)
    : "public";

  return {
    theme,
    emailNotifications: s.email_notifications !== false,
    pushNotifications: s.push_notifications !== false,
    productUpdates: s.product_updates !== false,
    profileVisibility: visibility,
    copilotName: String(s.copilot_name || DEFAULT_COPILOT_NAME),
    copilotMemory: String(s.copilot_memory || ""),
    copilotMemorySource: isCopilotMemorySource(s.copilot_memory_source)
      ? s.copilot_memory_source
      : "",
  };
}

export function passwordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak", color: "#DC4A5A" };
  if (score <= 3) return { score, label: "Fair", color: "#D97706" };
  if (score === 4) return { score, label: "Strong", color: "#14B8A6" };
  return { score, label: "Excellent", color: "#066BD3" };
}
