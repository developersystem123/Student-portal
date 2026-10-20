/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
// Site template footer (index.html) carrying EduPortal's copy and links — the same ones as the
// portal's public Footer. Markup keeps the template's classes so its CSS and animations still apply.
// Plain <a> on purpose: leaving this page must be a full load so the template's global CSS/JS
// never carries over into the rest of the portal.

import BrandLogo from "./BrandLogo";
import NewsletterForm from "./NewsletterForm";
import { FOOTER_COLUMNS, LEGAL_LINKS } from "./nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__shape-bg" style={{ backgroundImage: "url(/site/assets/images/shapes/site-footer-shape-bg.png)" }} />
      <div className="site-footer__logo-and-contact-box">
        <div className="container">
          <div className="site-footer__logo-and-contact-box-inner">
            <div className="site-footer__logo-box wow fadeInLeft" data-wow-delay="100ms">
              <div className="site-footer__logo">
                <BrandLogo onDark size="lg" />
              </div>
              <p className="site-footer__text">
                An AI-powered learning platform that helps students master new skills with personalized courses,
                quizzes, and real-time help.
              </p>
            </div>

          </div>
        </div>
      </div>
      <div className="site-footer__top">
        <div className="container">
          <div className="site-footer__top-inner">
            <div className="row">
              <div className="col-xl-6 col-lg-6 wow fadeInUp" data-wow-delay="300ms">
                <div className="site-footer__top-left">
                  <div className="site-footer__contact-info">
                    <ul className="list-unstyled site-footer__contact-info-list">
                      <li>
                        <div className="site-footer__contact-info-icon-box">
                          <div className="site-footer__contact-info-icon">
                            <span className="icon-envelope" />
                            <p className="site-footer__contact-info-icon-text">Email Address:</p>
                          </div>
                          <p className="site-footer__contact-info-text">
                            <a href="mailto:hello@eduportal.app">hello@eduportal.app</a>
                          </p>
                        </div>
                      </li>
                      <li>
                        <div className="site-footer__contact-info-icon-box">
                          <div className="site-footer__contact-info-icon">
                            <span className="icon-location" />
                            <p className="site-footer__contact-info-icon-text">Location:</p>
                          </div>
                          <p className="site-footer__contact-info-text">
                            Bhai Wala, Faisalabad,{" "}
                            <br />
                            {" "}Pakistan
                          </p>
                        </div>
                      </li>
                    </ul>
                    <ul className="list-unstyled site-footer__contact-info-list site-footer__contact-info-list--two">
                      <li>
                        <div className="site-footer__contact-info-icon-box">
                          <div className="site-footer__contact-info-icon">
                            <span className="icon-phone" />
                            <p className="site-footer__contact-info-icon-text">Phone:</p>
                          </div>
                          <p className="site-footer__contact-info-text">
                            <a href="tel:+923111712818">0311 1712818</a>
                          </p>
                        </div>
                      </li>
                      <li>
                        <div className="site-footer__contact-info-icon-box">
                          <div className="site-footer__contact-info-icon">
                            <span className="icon-clock" />
                            <p className="site-footer__contact-info-icon-text">Working Hour:</p>
                          </div>
                          <p className="site-footer__contact-info-text">
                            Monday - Friday{" "}
                            <br />
                            {" "}9:00 - 18:00
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 wow fadeInUp" data-wow-delay="300ms">
                <div className="site-footer__top-right">
                  <div className="row">
                    {FOOTER_COLUMNS.map((column, index) => (
                      <div key={column.title} className="col-xl-6 col-lg-6 col-md-6">
                        <div className={index === 0 ? "site-footer__links" : "site-footer__useful-links"}>
                          <h2 className="site-footer__title">{column.title}</h2>
                          <ul className="site-footer__links-list list-unstyled">
                            {column.links.map((link) => (
                              <li key={link.href}>
                                <a href={link.href}>
                                  <span className="icon-plus" />
                                  {" "}{link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="site-footer__newsletter-box">
                    <h2 className="site-footer__title">Newsletter</h2>
                    <NewsletterForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="site-footer__bottom-inner">
                <div className="site-footer__copyright">
                  <p className="site-footer__copyright-text">
                    Copyright © {new Date().getFullYear()}{" "}
                    <a href="/">EduPortal</a>
                    . All Rights Reserved
                  </p>
                </div>
                <ul className="list-unstyled site-footer__legal">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.href}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
