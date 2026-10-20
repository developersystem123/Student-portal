/* eslint-disable @next/next/no-img-element */
// Full-screen brand preloader shown on a first visit while the page streams in (app/loading.tsx).
// It sits outside every section layout, so it is styled from app/globals.css and takes its theme
// from html[data-boot-theme], which the root layout sets before first paint.

export default function AppPreloader() {
  return (
    <div className="edu-preloader" role="status" aria-live="polite">
      <div className="edu-preloader__inner">
        <div className="edu-preloader__badge">
          <svg className="edu-preloader__ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="edu-preloader__track" cx="60" cy="60" r="54" />
            <circle className="edu-preloader__arc" cx="60" cy="60" r="54" />
          </svg>
          <span className="edu-preloader__tile">
            <img src="/xtroedge-x.svg" alt="" width={64} height={64} />
          </span>
        </div>
        <p className="edu-preloader__name">EduPortal</p>
        <p className="edu-preloader__tagline">LEARN · BUILD · GROW</p>
      </div>
      <span className="edu-preloader__sr">Loading EduPortal…</span>
    </div>
  );
}
