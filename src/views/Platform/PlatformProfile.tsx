"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Settings2,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { ApiClientError, apiGet, apiSend } from "@/lib/api";
import { useStudent } from "@/components/dashboard/StudentContext";
import {
  EMPTY_PREFERENCES,
  EMPTY_PROFILE,
  mapApiProfile,
  mapApiSettings,
  type PreferencesFormState,
  type ProfileFormState,
  type ProfileSectionId,
} from "@/lib/profile/types";
import { Button, EmptyState } from "@/components/ui/primitives";
import {
  PersonalInfoForm,
  PreferencesSection,
  ProfileHeader,
  ProfilePhotoSection,
  ProfileSkeleton,
  SaveBar,
  SecuritySection,
} from "@/components/profile";

const NAV: { id: ProfileSectionId; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "personal", label: "Personal", icon: User },
  { id: "photo", label: "Photo", icon: ImageIcon },
  { id: "security", label: "Security", icon: Lock },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function validateProfile(draft: ProfileFormState) {
  const errors: Partial<Record<keyof ProfileFormState, string>> = {};
  if (!draft.fullName.trim()) errors.fullName = "Full name is required";
  if (draft.username.trim()) {
    if (draft.username.trim().length < 3) {
      errors.username = "At least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(draft.username.trim())) {
      errors.username = "Only letters, numbers, and underscores";
    }
  }
  if (draft.phone.trim() && !/^[+\d\s()-]+$/.test(draft.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }
  if (
    draft.dateOfBirth.trim() &&
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.dateOfBirth.trim())
  ) {
    errors.dateOfBirth = "Use a valid date";
  }
  if (draft.bio.length > 500) errors.bio = "Bio must be 500 characters or less";
  return errors;
}

export default function PlatformProfile() {
  const searchParams = useSearchParams();
  const { refresh: refreshStudent } = useStudent();
  const initialSection = (searchParams.get("section") ||
    "overview") as ProfileSectionId;

  const [section, setSection] = useState<ProfileSectionId>(
    NAV.some((n) => n.id === initialSection) ? initialSection : "overview",
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [savedProfile, setSavedProfile] = useState<ProfileFormState>({
    ...EMPTY_PROFILE,
  });
  const [draftProfile, setDraftProfile] = useState<ProfileFormState>({
    ...EMPTY_PROFILE,
  });
  const [savedPrefs, setSavedPrefs] = useState<PreferencesFormState>({
    ...EMPTY_PREFERENCES,
  });
  const [draftPrefs, setDraftPrefs] = useState<PreferencesFormState>({
    ...EMPTY_PREFERENCES,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileFormState, string>>
  >({});

  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToast({ message, tone });
      window.setTimeout(() => setToast(null), 3800);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [profileRes, settingsRes] = await Promise.all([
        apiGet<{ profile: Record<string, unknown> | null }>("/api/me/profile"),
        apiGet<{ settings: Record<string, unknown> | null }>("/api/me/settings"),
      ]);
      const profile = mapApiProfile(profileRes.profile);
      const prefs = mapApiSettings(settingsRes.settings);
      setSavedProfile(profile);
      setDraftProfile(profile);
      setSavedPrefs(prefs);
      setDraftPrefs(prefs);
      document.documentElement.setAttribute("data-theme", prefs.theme);
      document.body.setAttribute("data-theme", prefs.theme);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const next = searchParams.get("section") as ProfileSectionId | null;
    if (next && NAV.some((n) => n.id === next)) setSection(next);
  }, [searchParams]);

  const profileDirty = useMemo(
    () => JSON.stringify(draftProfile) !== JSON.stringify(savedProfile),
    [draftProfile, savedProfile],
  );
  const prefsDirty = useMemo(
    () => JSON.stringify(draftPrefs) !== JSON.stringify(savedPrefs),
    [draftPrefs, savedPrefs],
  );
  const dirty = profileDirty || prefsDirty;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", draftPrefs.theme);
    document.body.setAttribute("data-theme", draftPrefs.theme);
  }, [draftPrefs.theme]);

  const updateProfile = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updatePrefs = <K extends keyof PreferencesFormState>(
    key: K,
    value: PreferencesFormState[K],
  ) => {
    setDraftPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const discard = () => {
    setDraftProfile(savedProfile);
    setDraftPrefs(savedPrefs);
    setFieldErrors({});
    setEditing(false);
    if (dirty) showToast("Changes discarded");
  };

  const save = async () => {
    const errors = validateProfile(draftProfile);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setSection("personal");
      showToast("Fix the highlighted fields", "error");
      return;
    }

    setSaving(true);
    try {
      if (profileDirty) {
        const res = await apiSend<{ profile: Record<string, unknown> | null }>(
          "/api/me/profile",
          "PUT",
          {
            fullName: draftProfile.fullName.trim(),
            username: nullable(draftProfile.username),
            phone: nullable(draftProfile.phone),
            dateOfBirth: nullable(draftProfile.dateOfBirth),
            bio: nullable(draftProfile.bio),
            location: nullable(draftProfile.location),
            website: nullable(draftProfile.website),
            github: nullable(draftProfile.github),
            linkedin: nullable(draftProfile.linkedin),
            portfolio: nullable(draftProfile.portfolio),
            institute: nullable(draftProfile.institute),
            degree: nullable(draftProfile.degree),
            branch: nullable(draftProfile.branch),
            gradYear: nullable(draftProfile.gradYear),
          },
        );
        const mapped = mapApiProfile({
          ...res.profile,
          email: draftProfile.email,
          image_url: draftProfile.imageUrl,
          account_status: draftProfile.accountStatus,
          role: draftProfile.role,
        });
        setSavedProfile(mapped);
        setDraftProfile(mapped);
      }

      if (prefsDirty) {
        const res = await apiSend<{ settings: Record<string, unknown> | null }>(
          "/api/me/settings",
          "PUT",
          {
            theme: draftPrefs.theme,
            emailNotifications: draftPrefs.emailNotifications,
            pushNotifications: draftPrefs.pushNotifications,
            productUpdates: draftPrefs.productUpdates,
            profileVisibility: draftPrefs.profileVisibility,
          },
        );
        const mapped = mapApiSettings(res.settings);
        setSavedPrefs(mapped);
        setDraftPrefs(mapped);
      }

      setEditing(false);
      showToast("Profile saved", "success");
      await refreshStudent();
    } catch (e) {
      const message =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Unable to save changes";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const jump = (id: ProfileSectionId) => {
    setSection(id);
    if (id !== "overview") {
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 4px 40px" }}>
        <ProfileSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 4px 40px" }}>
        <EmptyState
          title="Unable to load profile"
          description={loadError}
          action={<Button onClick={() => void load()}>Try again</Button>}
        />
      </div>
    );
  }

  const showPersonal = section === "overview" || section === "personal";
  const showPhoto = section === "overview" || section === "photo";
  const showSecurity = section === "overview" || section === "security";
  const showPrefs = section === "overview" || section === "preferences";

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 4px 40px" }}>
      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            style={{
              position: "fixed",
              top: 20,
              left: "50%",
              x: "-50%",
              zIndex: 1600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 14,
              background:
                toast.tone === "error"
                  ? "rgba(127,29,29,0.95)"
                  : "rgba(15,23,42,0.95)",
              color: "#fff",
              border:
                toast.tone === "error"
                  ? "1px solid rgba(248,113,113,0.45)"
                  : "1px solid rgba(108,99,255,0.4)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {toast.tone === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} color="#00c9a7" />
            )}
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <ProfileHeader
          profile={draftProfile}
          editing={editing}
          onEdit={() => {
            setEditing(true);
            jump("personal");
          }}
          onCancel={discard}
          onJump={jump}
        />

        <div className="profile-mgmt-layout">
          <nav
            aria-label="Profile sections"
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              borderRadius: 20,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              height: "max-content",
              position: "sticky",
              top: 16,
            }}
          >
            {NAV.map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jump(item.id)}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: active ? "rgba(108,99,255,0.1)" : "transparent",
                    color: active ? "#6c63ff" : "var(--text-muted)",
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 750,
                    fontSize: 13.5,
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            {showPersonal ? (
              <PersonalInfoForm
                draft={draftProfile}
                errors={fieldErrors}
                disabled={!editing}
                onChange={updateProfile}
              />
            ) : null}
            {showPhoto ? (
              <ProfilePhotoSection
                imageUrl={draftProfile.imageUrl}
                fullName={draftProfile.fullName}
                onSynced={(url) => {
                  setDraftProfile((p) => ({ ...p, imageUrl: url }));
                  setSavedProfile((p) => ({ ...p, imageUrl: url }));
                  void refreshStudent();
                }}
                onToast={showToast}
              />
            ) : null}
            {showSecurity ? <SecuritySection onToast={showToast} /> : null}
            {showPrefs ? (
              <PreferencesSection
                draft={draftPrefs}
                disabled={!editing}
                onChange={updatePrefs}
              />
            ) : null}

            <SaveBar
              dirty={dirty}
              saving={saving}
              onSave={() => void save()}
              onDiscard={discard}
            />
          </div>
        </div>
      </div>

      <style>{`
        .profile-mgmt-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .profile-mgmt-layout {
            grid-template-columns: 1fr;
          }
          .profile-mgmt-layout nav {
            position: static !important;
            flex-direction: row !important;
            overflow-x: auto;
            gap: 4px !important;
          }
          .profile-mgmt-layout nav button {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
