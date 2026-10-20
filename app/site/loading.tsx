// Shown while a public page streams in. Rendered inside the site layout, so the header and footer
// stay put and only the page body is replaced.
export default function SiteLoading() {
  return (
    <div className="edu-site-loading" role="status" aria-live="polite">
      <span className="edu-site-loading__spinner" aria-hidden="true" />
      <span className="edu-sr-only">Loading page…</span>
    </div>
  );
}
