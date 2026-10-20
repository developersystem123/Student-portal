import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Outfit, Roboto_Serif } from "next/font/google";
import SiteScripts from "@/components/site/SiteScripts";
import ThemeSwitcher from "@/components/site/ThemeSwitcher";
import SitePage from "@/components/site/SitePage";
import { THEME_COOKIE } from "@/lib/theme";
import MainHeader, { type HeaderAccount } from "@/components/site/MainHeader";
import StickyHeader from "@/components/site/StickyHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MobileNav from "@/components/site/MobileNav";
import SearchPopup from "@/components/site/SearchPopup";
import { getAccount, getCourses, isUsingFallbackCatalogue } from "@/components/site/data";

const outfit = Outfit({ subsets: ["latin"] });
const robotoSerif = Roboto_Serif({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "EduPortal — Learn, Build, Grow", template: "%s · EduPortal" },
  description: "EduPortal online courses, live classes and expert instructors.",
};

const CSS = "/site/assets/css/";

// Same order as the template's <head> (index.html plus the extra modules its inner pages load).
// The reset goes first so it only neutralises the portal's global styles and never the template's.
// The 42 template stylesheets are concatenated, in this exact order, into one file by
// scripts/build-site-css.mjs (wired to predev/prebuild) — one request instead of 42, same cascade.
const STYLESHEETS = [
  "/site/site-reset.css",
  `${CSS}site-template.css`,
  // EduPortal colours, logo, header and footer — after the template so it overrides it.
  "/site/site-brand.css",
  // EduPortal-specific page sections, one file per group of pages.
  ...["home", "company", "catalog", "forms", "content", "auth"].map((name) => `/site/pages/${name}.css`),
  // Phone and tablet overrides for the template's desktop-first layouts.
  "/site/site-responsive.css",
  // The template's dark.css in EduPortal colours; only active under .site-dark. Must stay last.
  "/site/site-dark.css",
];

// The template reads its fonts from these variables; point them at the self-hosted next/font files.
// (0,1,1) specificity so it overrides the template's `:root` declaration.
const fontVariables = `html:has(.site-page){--site-font:${outfit.style.fontFamily};--site-font-two:${robotoSerif.style.fontFamily};}`;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Rendered server-side from the saved choice so the page never flashes the wrong theme.
  const [cookieStore, account] = await Promise.all([cookies(), getAccount()]);
  const dark = cookieStore.get(THEME_COOKIE)?.value === "dark";
  // Prime the catalogue (React caches it, so the page reuses this same read) purely to learn whether
  // the database answered — if it didn't, the visitor is told the courses aren't the live ones.
  await getCourses();
  const degraded = isUsingFallbackCatalogue();

  return (
    <>
      {STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="site" />
      ))}
      <style>{fontVariables}</style>

      <SitePage dark={dark}>
        <a className="edu-skip-link" href="#main-content">Skip to content</a>
        <div className="custom-cursor__cursor" />
        <div className="custom-cursor__cursor-two" />

        <div className="page-wrapper">
          <MainHeader dark={dark} account={account} />
          <StickyHeader />
          {degraded && (
            <div className="edu-data-notice" role="status">
              <div className="container">
                <p>
                  <strong>Live course data is temporarily unavailable.</strong> You&apos;re seeing our
                  built-in catalogue — some details may be out of date.
                </p>
              </div>
            </div>
          )}
          <main id="main-content" tabIndex={-1}>{children}</main>
          <SiteFooter />
        </div>

        <MobileNav dark={dark} account={account} />
        <SearchPopup />

        {/* Fixed to the viewport, so it can't live inside the footer; its own landmark keeps it
            from being stray content once it appears. */}
        <aside aria-label="Back to top">
          <a href="#" data-target="html" className="scroll-to-target scroll-to-top">
            <span className="scroll-to-top__wrapper">
              <span className="scroll-to-top__inner" />
            </span>
            {/* Shown instead of the rotated bar below 1200px, where there's no gutter for it. */}
            <svg className="scroll-to-top__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
            <span className="scroll-to-top__text"> Go Back Top</span>
          </a>
        </aside>
      </SitePage>

      <SiteScripts />
      <ThemeSwitcher />
    </>
  );
}
