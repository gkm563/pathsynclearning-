"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  MonitorSmartphone,
  Trash2,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ApiClientError, apiGet, apiSend } from "@/lib/api";
import { passwordStrength, type ProfileSession } from "@/lib/profile/types";
import { Button } from "@/components/ui/primitives";
import {
  ConfirmDialog,
  FieldError,
  PROFILE_COLS,
  SectionHeading,
  TextField,
  fieldInput,
  fieldLabel,
  sectionCard,
} from "./shared";

export function SecuritySection({
  onToast,
}: {
  onToast: (message: string, tone?: "success" | "error") => void;
}) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const passwordEnabled = Boolean(user?.passwordEnabled);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdSaving, setPwdSaving] = useState(false);

  const [sessions, setSessions] = useState<ProfileSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [revoking, setRevoking] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const strength = passwordStrength(newPassword);

  const loadSessions = async () => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const data = await apiGet<{ sessions: ProfileSession[] }>(
        "/api/me/sessions",
      );
      setSessions(data.sessions || []);
    } catch (e) {
      setSessions([]);
      setSessionsError(
        e instanceof Error ? e.message : "Unable to load sessions",
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const changePassword = async () => {
    const next: Record<string, string> = {};
    if (passwordEnabled && !currentPassword) {
      next.currentPassword = "Current password is required";
    }
    if (newPassword.length < 8) next.newPassword = "At least 8 characters";
    else if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      next.newPassword = "Use upper, lower, and a number";
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setPwdErrors(next);
    if (Object.keys(next).length) return;

    setPwdSaving(true);
    try {
      if (passwordEnabled) {
        await apiSend("/api/me/password", "POST", {
          currentPassword,
          newPassword,
        });
      } else if (user) {
        // First-time password for social accounts
        await user.updatePassword({ newPassword });
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdErrors({});
      onToast("Password updated successfully", "success");
      await user?.reload();
    } catch (e) {
      const message =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Unable to change password";
      if (message.toLowerCase().includes("current")) {
        setPwdErrors({ currentPassword: message });
      } else {
        setPwdErrors({ newPassword: message });
      }
      onToast(message, "error");
    } finally {
      setPwdSaving(false);
    }
  };

  const revokeOthers = async () => {
    setRevoking(true);
    try {
      await apiSend("/api/me/sessions", "POST", { revokeOthers: true });
      await loadSessions();
      onToast("Signed out of other sessions", "success");
    } catch (e) {
      onToast(
        e instanceof Error ? e.message : "Unable to revoke sessions",
        "error",
      );
    } finally {
      setRevoking(false);
    }
  };

  const revokeOne = async (sessionId: string) => {
    setRevoking(true);
    try {
      await apiSend("/api/me/sessions", "POST", { sessionId });
      await loadSessions();
      onToast("Session revoked", "success");
    } catch (e) {
      onToast(
        e instanceof Error ? e.message : "Unable to revoke session",
        "error",
      );
    } finally {
      setRevoking(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await apiSend("/api/me/account", "POST", { confirmation: "DELETE" });
      onToast("Account deleted", "success");
      await signOut({ redirectUrl: "/" });
      router.replace("/");
    } catch (e) {
      onToast(
        e instanceof Error ? e.message : "Unable to delete account",
        "error",
      );
      setDeleting(false);
    }
  };

  return (
    <section id="security" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={sectionCard}>
        <SectionHeading
          title={passwordEnabled ? "Change password" : "Set a password"}
          description={
            passwordEnabled
              ? "Choose a strong password you don’t reuse elsewhere."
              : "You signed in with a social provider. Optionally add a password for email sign-in."
          }
        />

        {!isLoaded ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5 }}>
            Checking sign-in methods…
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {passwordEnabled ? (
                <PasswordField
                  id="currentPassword"
                  label="Current password"
                  value={currentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                  onChange={setCurrentPassword}
                  error={pwdErrors.currentPassword}
                  autoComplete="current-password"
                />
              ) : null}
              <PasswordField
                id="newPassword"
                label={passwordEnabled ? "New password" : "Password"}
                value={newPassword}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                onChange={setNewPassword}
                error={pwdErrors.newPassword}
                autoComplete="new-password"
              />
              <PasswordField
                id="confirmPassword"
                label="Confirm password"
                value={confirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                onChange={setConfirmPassword}
                error={pwdErrors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            {newPassword ? (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    fontWeight: 700,
                    color: strength.color,
                    marginBottom: 6,
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  <span>Password strength</span>
                  <span>{strength.label}</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: "var(--border-light)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      height: "100%",
                      background: strength.color,
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <Button disabled={pwdSaving} onClick={() => void changePassword()}>
                {pwdSaving ? <Loader2 size={15} /> : <KeyRound size={15} />}
                {pwdSaving
                  ? "Updating…"
                  : passwordEnabled
                    ? "Update password"
                    : "Set password"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div style={sectionCard}>
        <SectionHeading
          title="Active sessions"
          description="Devices currently signed in to your PathEd account."
          action={
            <Button
              variant="secondary"
              disabled={revoking || sessionsLoading}
              onClick={() => void revokeOthers()}
            >
              <LogOut size={15} />
              Log out others
            </Button>
          }
        />
        {sessionsLoading ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5 }}>
            Loading sessions…
          </p>
        ) : sessionsError ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: PROFILE_COLS.danger, fontSize: 13.5 }}>
              {sessionsError}
            </p>
            <Button variant="secondary" onClick={() => void loadSessions()}>
              Retry
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5 }}>
            No active sessions found.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1.5px solid var(--border-light)",
                  background: "var(--bg-alt)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                  <MonitorSmartphone size={18} color={PROFILE_COLS.primary} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: "var(--text-main)",
                      }}
                    >
                      {s.is_current ? "This device" : "Other device"}
                      {s.is_current ? (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            color: PROFILE_COLS.success,
                            fontWeight: 800,
                          }}
                        >
                          CURRENT
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      Last active{" "}
                      {s.last_active_at
                        ? new Date(s.last_active_at).toLocaleString()
                        : "unknown"}
                    </div>
                  </div>
                </div>
                {!s.is_current ? (
                  <Button
                    variant="ghost"
                    disabled={revoking}
                    onClick={() => void revokeOne(s.id)}
                    style={{ color: PROFILE_COLS.danger }}
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          ...sectionCard,
          borderColor: "rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.04)",
        }}
      >
        <SectionHeading
          title="Delete account"
          description="Permanently remove your PathEd data, progress, and wallet. This cannot be undone."
        />
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={15} /> Delete account
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        description='Type DELETE to confirm. All profile data, progress, and sessions will be removed.'
        confirmLabel="Delete forever"
        loading={deleting}
        confirmDisabled={deleteConfirm !== "DELETE"}
        onCancel={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setDeleteConfirm("");
          }
        }}
        onConfirm={() => void deleteAccount()}
      >
        <div style={{ marginTop: 16 }}>
          <TextField
            id="deleteConfirm"
            label='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            autoComplete="off"
          />
        </div>
      </ConfirmDialog>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={fieldLabel}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...fieldInput,
            paddingRight: 44,
            borderColor: error ? "rgba(239,68,68,0.55)" : "var(--border-light)",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}
