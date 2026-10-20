// Page links for the course catalogue, in the template's blog-list pagination markup. Plain links
// (?page=N) so every page is server-rendered, shareable and works without JavaScript.

type Props = { page: number; totalPages: number; href: (page: number) => string; label?: string };

// Every page when there are few; otherwise the first, the last and the current page's neighbours.
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

export default function Pagination({ page, totalPages, href, label = "Pagination" }: Props) {
  if (totalPages <= 1) return null;
  const arrow = (target: number, rel: "prev" | "next") => {
    const icon = <span className={`fas fa-angle-${rel === "prev" ? "left" : "right"}`} aria-hidden="true" />;
    const text = rel === "prev" ? "Previous page" : "Next page";
    const disabled = rel === "prev" ? page <= 1 : page >= totalPages;
    return <li className={`edu-pagination__arrow${disabled ? " edu-pagination__arrow--disabled" : ""}`}>
      {disabled ? <span aria-hidden="true">{icon}</span> : <a href={href(target)} rel={rel} aria-label={text}>{icon}</a>}
    </li>;
  };

  return (
    <nav className="blog-list__pagination edu-pagination" aria-label={label}>
      <ul className="pg-pagination list-unstyled">
        {arrow(page - 1, "prev")}
        {pageItems(page, totalPages).map((p, i) => p === "gap"
          ? <li key={`gap-${i}`} className="edu-pagination__gap" aria-hidden="true">…</li>
          : <li key={p} className={p === page ? "active" : undefined}>
            <a href={href(p)} aria-label={`Page ${p}`} aria-current={p === page ? "page" : undefined}>{p}</a>
          </li>)}
        {arrow(page + 1, "next")}
      </ul>
    </nav>
  );
}
