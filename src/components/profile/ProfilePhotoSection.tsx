"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { apiSend } from "@/lib/api";
import { Button } from "@/components/ui/primitives";
import { PROFILE_COLS, SectionHeading, sectionCard } from "./shared";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function ProfilePhotoSection({
  imageUrl,
  fullName,
  onSynced,
  onToast,
}: {
  imageUrl: string;
  fullName: string;
  onSynced: (url: string) => void;
  onToast: (message: string, tone?: "success" | "error") => void;
}) {
  const { user, isLoaded } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const display = preview || imageUrl;
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "PE";

  const validate = (file: File) => {
    if (!ALLOWED.has(file.type)) {
      return "Use JPEG, PNG, WebP, or GIF.";
    }
    if (file.size > MAX_BYTES) {
      return "Image must be 2 MB or smaller.";
    }
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
    const url = URL.createObjectURL(file);
    setPreview(url);
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
      onToast("Profile photo updated", "success");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to upload photo";
      setError(message);
      onToast(message, "error");
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
      onToast("Profile photo removed", "success");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to remove photo";
      setError(message);
      onToast(message, "error");
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
    <section id="photo" style={sectionCard}>
      <SectionHeading
        title="Profile photo"
        description="Upload a clear square image. Files are stored securely via your auth provider."
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            border: "1.5px solid var(--border-light)",
            background: display
              ? `center/cover url(${display})`
              : "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            flexShrink: 0,
          }}
          aria-hidden={!display}
        >
          {!display ? initials : null}
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Button
              variant="secondary"
              disabled={!isLoaded || uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={15} /> Choose image
            </Button>
            <Button
              disabled={!pendingFile || uploading}
              onClick={() => void save()}
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              {uploading ? "Uploading…" : "Save photo"}
            </Button>
            {pendingFile ? (
              <Button variant="ghost" disabled={uploading} onClick={discardPreview}>
                Discard preview
              </Button>
            ) : null}
            {imageUrl && !pendingFile ? (
              <Button
                variant="danger"
                disabled={uploading}
                onClick={() => void remove()}
              >
                <Trash2 size={15} /> Remove
              </Button>
            ) : null}
          </div>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12.5,
              color: "var(--text-muted)",
            }}
          >
            JPEG, PNG, WebP, or GIF · max 2 MB
          </p>
          {error ? (
            <p
              role="alert"
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: PROFILE_COLS.danger,
              }}
            >
              {error}
            </p>
          ) : null}
          {pendingFile ? (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: PROFILE_COLS.primary,
                fontWeight: 600,
              }}
            >
              Preview ready — save to apply.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
