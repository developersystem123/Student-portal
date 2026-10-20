// Light/dark switch for the site page. Plain markup on purpose: script.js copies the header's
// HTML into the sticky header, which would drop a React onClick — ThemeSwitcher handles clicks
// for every copy through one document listener instead. Styles live in site-brand.css.

export { THEME_COOKIE } from "@/lib/theme";

type Props = {
  dark: boolean;
  /** "icon": round header button. "row": labelled switch for the mobile menu. */
  variant?: "icon" | "row";
};

export default function ThemeToggle({ dark, variant = "icon" }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title="Dark mode"
      data-site-theme-toggle=""
      className={`site-theme-toggle site-theme-toggle--${variant}`}
    >
      <svg className="site-theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <svg className="site-theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {variant === "row" && (
        <>
          <span className="site-theme-toggle__label">Dark mode</span>
          <span className="site-theme-toggle__track" />
        </>
      )}
    </button>
  );
}
