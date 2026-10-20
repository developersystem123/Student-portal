// Site template header (index.html) carrying EduPortal's navigation — the same links as the
// portal's public Navbar. Markup keeps the template's classes so its CSS and script.js (sticky
// copy, mobile menu, search popup) bind exactly as in the original.
// Plain <a> on purpose: every page load must be a full load so the template's global CSS/JS never
// carries over into the rest of the portal.

import BrandLogo from "./BrandLogo";
import MainMenuList from "./MainMenuList";
import ThemeToggle from "./ThemeToggle";
import { SIGN_IN, SIGN_UP } from "./nav";

export type HeaderAccount = { href: string; label: string } | null;

export default function MainHeader({ dark, account }: { dark: boolean; account: HeaderAccount }) {
  return (
    <header className="main-header">
      <div className="main-menu__top">
        <div className="container">
          <div className="main-menu__top-inner">
            <ul className="list-unstyled main-menu__contact-list">
              <li>
                <div className="icon">
                  <i className="icon-email" />
                </div>
                <div className="text">
                  <p>
                    <a href="mailto:hello@eduportal.app">hello@eduportal.app</a>
                  </p>
                </div>
              </li>
              <li>
                <div className="icon">
                  <i className="icon-phone" />
                </div>
                <div className="text">
                  <p>
                    <a href="tel:+923111712818">0311 1712818</a>
                  </p>
                </div>
              </li>
            </ul>
            <ul className="list-unstyled main-menu__contact-list main-menu__location">
              <li>
                <div className="icon">
                  <i className="icon-location" />
                </div>
                <div className="text">
                  <p>Bhai Wala, Faisalabad, Pakistan</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <nav className="main-menu" aria-label="Main navigation">
        <div className="main-menu__wrapper">
          <div className="container">
            <div className="main-menu__wrapper-inner">
              <div className="main-menu__left">
                <div className="main-menu__logo">
                  <BrandLogo />
                </div>
              </div>
              <div className="main-menu__main-menu-box">
                <button type="button" className="mobile-nav__toggler" aria-label="Open menu" aria-controls="edu-mobile-nav" aria-expanded="false">
                  <i className="fa fa-bars" aria-hidden="true" />
                </button>
                <MainMenuList />
              </div>
              <div className="main-menu__right">
                <div className="main-menu__search-cart-box">
                  <ThemeToggle dark={dark} />
                  <div className="main-menu__search-box">
                    <button type="button" className="main-menu__search edu-search-trigger icon-search" aria-label="Search courses" aria-haspopup="dialog" aria-controls="edu-course-search-dialog" aria-expanded="false" />
                  </div>
                </div>
                <div className="main-menu__btn-boxes">
                  {account ? (
                    <div className="main-menu__btn-box-2">
                      <a href={account.href} className="thm-btn">{account.label}</a>
                    </div>
                  ) : (
                    <>
                      <div className="main-menu__btn-box-1">
                        <a href={SIGN_IN} className="thm-btn">Sign in</a>
                      </div>
                      <div className="main-menu__btn-box-2">
                        <a href={SIGN_UP} className="thm-btn">Get started</a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
