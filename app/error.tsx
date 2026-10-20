"use client";

import { useEffect } from "react";

// Portal-wide error boundary. The public site has its own, styled with the site chrome, in
// app/site/error.tsx. `reset()` re-renders the failed segment without a full reload.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-500/10 text-2xl font-bold text-[var(--danger,#dc2626)]" aria-hidden="true">
          !
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-[var(--muted)]">
          We hit an unexpected problem loading this page. Trying again usually fixes it.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="h-10 rounded-lg bg-[var(--primary,#15803d)] px-5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary,#15803d)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="h-10 rounded-lg border border-[var(--border)] px-5 text-sm font-semibold leading-10 transition hover:bg-black/5"
          >
            Go home
          </a>
        </div>
        {error.digest ? <p className="text-xs text-[var(--muted)]">Reference: {error.digest}</p> : null}
      </div>
    </div>
  );
}
