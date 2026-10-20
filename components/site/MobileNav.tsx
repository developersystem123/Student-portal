// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.
// Plain <a> on purpose: leaving this page must be a full load so the template's global CSS/JS
// never carries over into the rest of the portal.

import BrandLogo from "./BrandLogo";
import MobileNavFocus from "./MobileNavFocus";
import ThemeToggle from "./ThemeToggle";
import type { HeaderAccount } from "./MainHeader";
import { SIGN_IN, SIGN_UP } from "./nav";

export default function MobileNav({ dark, account }: { dark: boolean; account: HeaderAccount }) {
  return (
    <div className="mobile-nav__wrapper">
      <div className="mobile-nav__overlay mobile-nav__toggler" aria-hidden="true" />
      {/* /.mobile-nav__overlay */}
      <div className="mobile-nav__content" id="edu-mobile-nav" role="dialog" aria-modal="true" aria-label="Site menu">
        <button type="button" className="mobile-nav__close mobile-nav__toggler" aria-label="Close menu">
          <i className="fa fa-times" aria-hidden="true" />
        </button>
        <div className="logo-box">
          <BrandLogo onDark />
        </div>
        {/* /.logo-box */}
        <div className="mobile-nav__container" />
        {/* /.mobile-nav__container */}
        <ul className="mobile-nav__contact list-unstyled">
          <li>
            <i className="icon-envelope" aria-hidden="true" />
            {" "}
            <a href="mailto:hello@eduportal.app">hello@eduportal.app</a>
          </li>
          <li>
            <i className="icon-phone" aria-hidden="true" />
            {" "}
            <a href="tel:+923111712818">0311 1712818</a>
          </li>
          <li>
            <i className="icon-comments" aria-hidden="true" />
            {" "}
            <a href="/dashboard">Live chat weekdays, 9am–6pm</a>
          </li>
        </ul>
        {/* /.mobile-nav__contact */}
        <ThemeToggle dark={dark} variant="row" />
        {/* The header's Sign in / Get started buttons are hidden on small screens. */}
        <div className="edu-mobile-auth">
          {account ? (
            <a href={account.href} className="thm-btn">{account.label}</a>
          ) : (
            <>
              <a href={SIGN_IN} className="thm-btn edu-mobile-auth__secondary">Sign in</a>
              <a href={SIGN_UP} className="thm-btn">Get started</a>
            </>
          )}
        </div>
      </div>
      {/* /.mobile-nav__content */}
      <MobileNavFocus />
    </div>
  );
}
