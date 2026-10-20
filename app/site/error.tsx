"use client";

import { useEffect } from "react";

// Site-styled error boundary. It renders inside app/site/layout.tsx, so the visitor keeps the
// site header, footer and theme; only the page body is replaced. `reset()` retries the segment.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[site] unhandled error:", error);
  }, [error]);

  return (
    <section className="edu-site-error">
      <div className="container">
        <div className="edu-site-error__inner">
          <p className="edu-site-error__eyebrow">Error</p>
          <h1 className="edu-site-error__title">Something went wrong</h1>
          <p className="edu-site-error__text">
            We couldn&apos;t load this page just now. It&apos;s usually temporary — try again, or head back home.
          </p>
          <div className="edu-site-error__actions">
            <button type="button" className="thm-btn" onClick={reset}>
              <span className="icon-angles-right" aria-hidden="true" />
              Try again
            </button>
            <a href="/" className="edu-site-error__secondary">Go to homepage</a>
          </div>
          {error.digest ? <p className="edu-site-error__ref">Reference: {error.digest}</p> : null}
        </div>
      </div>
    </section>
  );
}
