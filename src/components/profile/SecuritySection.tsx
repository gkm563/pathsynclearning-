"use client";

import { useEffect, useState } from "react";
import { KeyRound, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ApiClientError, apiGet, apiSend } from "@/lib/api";
import type { ProfileSession } from "@/lib/profile/types";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
  IconButton,
  Input,
  PasswordInput,
  useToast,
} from "@/components/ui";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export function SecuritySection() {
  const router = useRouter();
  const toast = useToast();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const passwordEnabled = Boolean(user?.passwordEnabled);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdSaving, setPwdSaving] = useState(false);

  const [sessions, setSessions] = useState<ProfileSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [revoking, setRevoking] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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
        await user.updatePassword({ newPassword });
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdErrors({});
      toast.success("Password updated");
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
      toast.error(message);
    } finally {
      setPwdSaving(false);
    }
  };

  const revokeOthers = async () => {
    setRevoking(true);
    try {
      await apiSend("/api/me/sessions", "POST", { revokeOthers: true });
      await loadSessions();
      toast.success("Signed out of other sessions");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to revoke sessions");
    } finally {
      setRevoking(false);
    }
  };

  const revokeOne = async (sessionId: string) => {
    setRevoking(true);
    try {
      await apiSend("/api/me/sessions", "POST", { sessionId });
      await loadSessions();
      toast.success("Session revoked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to revoke session");
    } finally {
      setRevoking(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await apiSend("/api/me/account", "POST", { confirmation: "DELETE" });
      toast.success("Account deleted");
      await signOut({ redirectUrl: "/" });
      router.replace("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete account");
      setDeleting(false);
    }
  };

  return (
    <section id="security" className="flex min-w-0 flex-col gap-4">
      <Card className="min-w-0 overflow-hidden">
        <h3 className="type-h4 m-0 text-ink">
          {passwordEnabled ? "Change password" : "Set a password"}
        </h3>
        <p className="type-small mt-1 mb-5 text-muted">
          {passwordEnabled
            ? "Choose a strong password you don’t reuse elsewhere."
            : "You signed in with a social provider. Optionally add a password for email sign-in."}
        </p>

        {!isLoaded ? (
          <p className="type-small m-0 text-muted">Checking sign-in methods…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {passwordEnabled ? (
                <FormField
                  label="Current password"
                  error={pwdErrors.currentPassword}
                >
                  {(a) => (
                    <PasswordInput
                      {...a}
                      value={currentPassword}
                      autoComplete="current-password"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  )}
                </FormField>
              ) : null}
              <FormField
                label={passwordEnabled ? "New password" : "Password"}
                error={pwdErrors.newPassword}
              >
                {(a) => (
                  <PasswordInput
                    {...a}
                    value={newPassword}
                    autoComplete="new-password"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                )}
              </FormField>
              <FormField
                label="Confirm password"
                error={pwdErrors.confirmPassword}
              >
                {(a) => (
                  <PasswordInput
                    {...a}
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                )}
              </FormField>
            </div>

            <PasswordStrengthMeter password={newPassword} />

            <div className="flex justify-end">
              <Button
                loading={pwdSaving}
                onClick={() => void changePassword()}
              >
                <KeyRound size={15} aria-hidden />
                {passwordEnabled ? "Update password" : "Set password"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="type-h4 m-0 text-ink">Active sessions</h3>
            <p className="type-small mt-1 mb-0 text-muted">
              Devices currently signed in to your PathEd account.
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={revoking || sessionsLoading}
            onClick={() => void revokeOthers()}
          >
            <LogOut size={15} aria-hidden />
            Log out others
          </Button>
        </div>

        {sessionsLoading ? (
          <p className="type-small m-0 text-muted">Loading sessions…</p>
        ) : sessionsError ? (
          <ErrorState
            compact
            title="Couldn't load sessions"
            description="Retry to refresh the list of signed-in devices."
            detail={sessionsError}
            action={
              <Button variant="secondary" onClick={() => void loadSessions()}>
                Retry
              </Button>
            }
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            compact
            icon={<MonitorSmartphone size={18} aria-hidden />}
            title="No active sessions found"
            description="If you just signed in, try refreshing this list."
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MonitorSmartphone
                    size={18}
                    aria-hidden
                    className="shrink-0 text-primary"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="type-label m-0 text-ink">
                        {session.is_current ? "This device" : "Other device"}
                      </p>
                      {session.is_current ? (
                        <Badge tone="success">Current</Badge>
                      ) : null}
                    </div>
                    <p className="type-caption mt-0.5 mb-0 text-muted">
                      Last active{" "}
                      {session.last_active_at
                        ? new Date(session.last_active_at).toLocaleString()
                        : "unknown"}
                    </p>
                  </div>
                </div>
                {!session.is_current ? (
                  <IconButton
                    label="Revoke session"
                    variant="ghost"
                    disabled={revoking}
                    onClick={() => void revokeOne(session.id)}
                  >
                    <LogOut size={16} />
                  </IconButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="min-w-0 overflow-hidden border-[color-mix(in_srgb,var(--error)_28%,var(--line))] bg-[var(--error-soft)]">
        <h3 className="type-h4 m-0 text-ink">Delete account</h3>
        <p className="type-small mt-1 mb-4 text-muted">
          Permanently remove your PathEd data, progress, and wallet. This cannot
          be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={15} aria-hidden />
          Delete account
        </Button>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        tone="danger"
        title="Delete your account?"
        description="Type DELETE to confirm. All profile data, progress, and sessions will be removed."
        confirmLabel="Delete forever"
        loading={deleting}
        confirmDisabled={deleteConfirm !== "DELETE"}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteConfirm("");
        }}
        onConfirm={() => void deleteAccount()}
      >
        <FormField label='Type "DELETE" to confirm'>
          {(a) => (
            <Input
              {...a}
              value={deleteConfirm}
              autoComplete="off"
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          )}
        </FormField>
      </ConfirmDialog>
    </section>
  );
}
