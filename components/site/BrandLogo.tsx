/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
// EduPortal logo lockup used in place of the template's logo. Styles live in
// public/site/site-brand.css so they load with the rest of the page's CSS.

type Props = {
  /** Use on charcoal backgrounds (footer, mobile menu). */
  onDark?: boolean;
  size?: "md" | "lg";
};

export default function BrandLogo({ onDark = false, size = "md" }: Props) {
  const className = ["edu-logo", onDark && "edu-logo--on-dark", size === "lg" && "edu-logo--lg"]
    .filter(Boolean)
    .join(" ");
  const markSize = size === "lg" ? 48 : 40;

  return (
    <a href="/" className={className} aria-label="EduPortal home">
      <img src="/xtroedge-x.svg" alt="" width={markSize} height={markSize} className="edu-logo__mark" />
      <span className="edu-logo__text">
        <span className="edu-logo__name">EduPortal</span>
        <span className="edu-logo__tagline">LEARN · BUILD · GROW</span>
      </span>
    </a>
  );
}
