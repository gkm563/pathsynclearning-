"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiClientError, apiGet, apiSend } from "@/lib/api";
import { useToast } from "@/components/ui";
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
import {
  fieldErrorsFromApi,
  isProfileSectionId,
  type ProfileFieldErrors,
  type ProfileResponse,
  type SettingsResponse,
} from "./types";

/** Order used to decide which invalid field receives focus first. */
const FIELD_ORDER: (keyof ProfileFormState)[] = [
  "fullName",
  "username",
  "phone",
  "dateOfBirth",
  "bio",
];

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/** Client-side rules. Kept byte-for-byte in step with the server schema. */
function validateProfile(draft: ProfileFormState): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
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

function focusFirstError(errors: ProfileFieldErrors) {
  const first = FIELD_ORDER.find((key) => errors[key]);
  if (!first) return;
  window.requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(
      `[data-profile-field="${first}"]`,
    );
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.focus({ preventScroll: true });
  });
}

function messageFor(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Owns every piece of profile/preferences state: fetch, draft vs saved,
 * validation, the unsaved-changes guard and the save round-trip. The view stays
 * a layout concern.
 */
export function useProfileEditor() {
  const searchParams = useSearchParams();
  const { refresh: refreshStudent } = useStudent();
  const toast = useToast();

  const [section, setSection] = useState<ProfileSectionId>(() => {
    const initial = searchParams.get("section");
    return isProfileSectionId(initial) ? initial : "overview";
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

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
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [profileRes, settingsRes] = await Promise.all([
        apiGet<ProfileResponse>("/api/me/profile"),
        apiGet<SettingsResponse>("/api/me/settings"),
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
      setLoadError(messageFor(e, "Unable to load your profile."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // `?section=` is the deep link the account menu and /dashboard/settings use.
  useEffect(() => {
    const next = searchParams.get("section");
    if (isProfileSectionId(next)) setSection(next);
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

  // Theme is a live preview: it applies the moment it changes, before saving.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", draftPrefs.theme);
    document.body.setAttribute("data-theme", draftPrefs.theme);
  }, [draftPrefs.theme]);

  const updateProfile = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      if (key === "studentRegistrationId") return;
      setDraftProfile((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const updatePrefs = useCallback(
    <K extends keyof PreferencesFormState>(
      key: K,
      value: PreferencesFormState[K],
    ) => {
      setDraftPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setImageUrl = useCallback((url: string) => {
    setDraftProfile((p) => ({ ...p, imageUrl: url }));
    setSavedProfile((p) => ({ ...p, imageUrl: url }));
    void refreshStudent();
  }, [refreshStudent]);

  const discard = () => {
    setDraftProfile(savedProfile);
    setDraftPrefs(savedPrefs);
    setFieldErrors({});
    setEditing(false);
    if (dirty) {
      setSaveStatus("Changes discarded");
      toast.info("Changes discarded");
    }
  };

  const save = async () => {
    const errors = validateProfile(draftProfile);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setSection("personal");
      setSaveStatus("Some fields need attention before saving");
      toast.error("Fix the highlighted fields");
      focusFirstError(errors);
      return;
    }

    setSaving(true);
    setSaveStatus("Saving your changes…");
    try {
      if (profileDirty) {
        const res = await apiSend<ProfileResponse>(
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
        // Fields the profile endpoint doesn't echo back are carried over so the
        // header doesn't blank out after a save.
        const payload: Record<string, unknown> = {
          ...(res.profile ?? {}),
          email: draftProfile.email,
          image_url: draftProfile.imageUrl,
          account_status: draftProfile.accountStatus,
          role: draftProfile.role,
          student_registration_id: draftProfile.studentRegistrationId,
        };
        const mapped = mapApiProfile(payload);
        setSavedProfile(mapped);
        setDraftProfile(mapped);
      }

      if (prefsDirty) {
        const res = await apiSend<SettingsResponse>(
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
      setSaveStatus("Profile saved");
      toast.success("Profile saved");
      await refreshStudent();
    } catch (e) {
      const apiErrors = fieldErrorsFromApi(e);
      if (Object.keys(apiErrors).length) {
        setFieldErrors(apiErrors);
        setSection("personal");
        focusFirstError(apiErrors);
      }
      const message = messageFor(e, "Unable to save changes");
      setSaveStatus(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    section,
    setSection,
    loading,
    loadError,
    reload: load,
    saving,
    editing,
    startEditing: () => setEditing(true),
    saveStatus,
    draftProfile,
    savedProfile,
    draftPrefs,
    fieldErrors,
    dirty,
    updateProfile,
    updatePrefs,
    setImageUrl,
    discard,
    save,
  };
}
