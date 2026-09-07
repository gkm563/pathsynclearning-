"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { apiSend } from "@/lib/api";
import { Alert, Avatar, Button, Card, useToast } from "@/components/ui";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Avatar upload. The file goes to Clerk first, then the resulting URL is
 * mirrored to our own record via `PUT /api/me/avatar`.
 */
export function ProfilePhotoSection({
  imageUrl,
  fullName,
  onSynced,
}: {
  imageUrl: string;
  fullName: string;
  onSynced: (url: string) => void;
}) {
  const { user, isLoaded } = useUser();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const display = preview || imageUrl;

  const validate = (file: File) => {
    if (!ALLOWED.has(file.type)) return "Use JPEG, PNG, WebP, or GIF.";
    if (file.size > MAX_BYTES) return "Image must be 2 MB or smaller.";
    return "";
  };

  const onPick = (file: File | null) => {
    if (!file) return;
    const msg = validate(file);
    if (msg) {
      setError(msg);
      setPendingFile(null);
      setPreview(null);
      return;
    }
    setError("");
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!pendingFile || !user) return;
    setUploading(true);
    setError("");
    try {
      await user.setProfileImage({ file: pendingFile });
      await user.reload();
      const nextUrl = user.imageUrl || "";
      await apiSend("/api/me/avatar", "PUT", { imageUrl: nextUrl || null });
      onSynced(nextUrl);
      setPendingFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      toast.success("Profile photo updated");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to upload photo";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!user) return;
    setUploading(true);
    setError("");
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      await apiSend("/api/me/avatar", "PUT", { imageUrl: null });
      onSynced("");
      setPendingFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      toast.success("Profile photo removed");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to remove photo";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const discardPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section id="photo">
      <Card>
        <h2 className="type-h4 m-0 text-ink">Profile photo</h2>
        <p className="type-small mt-1 mb-5 max-w-prose text-muted">
          Upload a clear square image. Files are stored securely by your
          sign-in provider — JPEG, PNG, WebP or GIF, up to 2&nbsp;MB.
        </p>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Avatar
            src={display || null}
            name={fullName || "PathEd student"}
            size="xl"
            className="shrink-0"
          />

          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              aria-label="Choose a profile photo"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="min-h-11"
                disabled={!isLoaded || uploading}
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus size={15} aria-hidden />
                Choose image
              </Button>
              <Button
                className="min-h-11"
                loading={uploading}
                disabled={!pendingFile}
                onClick={() => void save()}
              >
                {uploading ? null : <Upload size={15} aria-hidden />}
                {uploading ? "Uploading…" : "Save photo"}
              </Button>
              {pendingFile ? (
                <Button
                  variant="ghost"
                  className="min-h-11"
                  disabled={uploading}
                  onClick={discardPreview}
                >
                  Discard preview
                </Button>
              ) : null}
              {imageUrl && !pendingFile ? (
                <Button
                  variant="danger"
                  className="min-h-11"
                  disabled={uploading}
                  onClick={() => void remove()}
                >
                  <Trash2 size={15} aria-hidden />
                  Remove
                </Button>
              ) : null}
            </div>

            <div aria-live="polite" className="mt-4 empty:mt-0">
              {error ? <Alert tone="error">{error}</Alert> : null}
              {!error && pendingFile ? (
                <Alert tone="info">Preview ready — save to apply.</Alert>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
