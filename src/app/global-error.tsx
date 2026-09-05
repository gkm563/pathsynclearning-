"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-sans), Plus Jakarta Sans, system-ui, sans-serif",
          background: "#fcfdff",
          color: "#1a1a2e",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#6c63ff" }}>
            PATHED
          </p>
          <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>Something went wrong</h1>
          <p style={{ color: "#666", lineHeight: 1.5, marginBottom: 20 }}>
            An unexpected error occurred. You can try again, or return home.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "10px 18px",
                background: "#6c63ff",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: 12,
                padding: "10px 18px",
                border: "1.5px solid #eaecff",
                fontWeight: 700,
                textDecoration: "none",
                color: "#1a1a2e",
              }}
            >
              Go home
            </a>
          </div>
          {error.digest ? (
            <p style={{ marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
              Ref: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
