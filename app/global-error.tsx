"use client";

// Last-resort boundary: catches an error thrown by the root layout itself, so it has to render its
// own <html>/<body>. Styles are inline because globals.css may not have loaded.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 12px" }}>EduPortal is temporarily unavailable</h1>
          <p style={{ margin: "0 0 24px", color: "#475569", lineHeight: 1.6 }}>
            Something went wrong before the page could load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 40,
              padding: "0 20px",
              border: 0,
              borderRadius: 8,
              background: "#15803d",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: 20, fontSize: 12, color: "#94a3b8" }}>Reference: {error.digest}</p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
