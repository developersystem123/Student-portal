/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import ApplicationForm from "@/components/site/forms/ApplicationForm";
import SectionTitle from "@/components/site/forms/SectionTitle";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: "Get in touch with the EduPortal team — support, sales, partnerships and press. We reply within one business day.",
  path: "/contact",
});
const channels = [
  { title: "Email", description: "We reply within 1 business day.", value: "hello@eduportal.app", href: "mailto:hello@eduportal.app", icon: "icon-envelope" },
  { title: "Live chat", description: "Available weekdays, 9am–6pm.", value: "Open in-app chat", href: "/dashboard", icon: "fas fa-comments" },
  { title: "Call us", description: "Talk to our team in Faisalabad.", value: "0311 1712818", href: "tel:+923111712818", icon: "icon-phone" },
];

// XtroEdge Software Company, Bhai Wala, Faisalabad (Plus Code F4CH+VQ5).
const lat = 31.47214;
const lon = 73.12948;

export default function ContactPage() {
  return <>
    <PageHeader title="Contact Us" parents={[]} />
    <section className="contact-two edu-contact-intro">
      <div className="container">
        <SectionTitle eyebrow="Get in touch">Talk to a <span>real human</span></SectionTitle>
        <p className="edu-lead">Questions about a course, a partnership idea, or just want to say hi? Drop us a note and we&apos;ll get back fast.</p>
        <ul className="row list-unstyled edu-channel-list">
          {channels.map((channel) => <li className="col-xl-4 col-md-6" key={channel.title}>
            <div className="contact-two__single edu-channel-card">
              <div className="contact-two__icon"><span className={channel.icon} aria-hidden="true" /></div>
              <h3 className="contact-two__title">{channel.title}</h3>
              <p>{channel.description}</p>
              <p><a href={channel.href}>{channel.value} <span className="icon-angles-right" aria-hidden="true" /></a></p>
            </div>
          </li>)}
        </ul>
      </div>
    </section>
    <section className="contact-three edu-contact-form-section">
      <div className="container"><div className="row">
        <div className="col-lg-6"><div className="contact-three__left"><div className="contact-three__img">
          <img src="/site/assets/images/edu/edu-art-contact-support.png" alt="An EduPortal support agent answering student questions over chat and email" loading="lazy" decoding="async" />
        </div><div className="edu-support-hours">
          <h3>Support hours</h3>
          <p>Mon — Fri <strong>9:00 — 18:00</strong></p>
          <p>Saturday <strong>10:00 — 14:00</strong></p>
          <p>Sunday <strong>Closed</strong></p>
        </div></div></div>
        <div className="col-lg-6"><div className="contact-three__right">
          <SectionTitle eyebrow="Send us a message">We&apos;re here to help and ready to hear from you</SectionTitle>
          <p className="edu-form-intro">We read every message. Please share as much detail as you can.</p>
          <ApplicationForm kind="contact" />
        </div></div>
      </div></div>
    </section>
    <section className="edu-map-section"><div className="container"><div className="edu-map-card">
      <div className="edu-map-info">
        <span className="icon-location" aria-hidden="true" />
        <h2>Visit our HQ</h2>
        <p>Drop by, say hi, or schedule a coffee with the team.</p>
        <address>XtroEdge Software Company<br />F4CH+VQ5, Bhai Wala<br />Faisalabad, Pakistan<br /><a href="tel:+923111712818">0311 1712818</a></address>
        <p className="edu-map-office">International office: XtroEdge LLC, Kansas City, Missouri, USA</p>
        <div className="edu-map-links"><a className="thm-btn" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`} target="_blank" rel="noopener noreferrer"><span className="icon-angles-right" /> Get directions</a>
          <a href={`https://www.openstreetmap.org/#map=14/${lat}/${lon}`} target="_blank" rel="noopener noreferrer">Open larger map</a></div>
      </div>
      {/* The OpenStreetMap embed iframe rendered as an empty grey box for most visitors (its tiles
          arrive slowly) and logged a cross-origin postMessage warning. The same tiles, stitched into
          one image at build time, render instantly and need no third-party script at runtime. */}
      <div className="edu-map-view">
        <img src="/site/assets/images/edu/edu-map-hq.png" alt="Street map showing XtroEdge Software Company in Bhai Wala, Faisalabad" width={1024} height={512} loading="lazy" decoding="async" />
        <span className="edu-map-pin" aria-hidden="true"><span className="icon-location" /></span>
        <p className="edu-map-credit">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</p>
      </div>
    </div></div></section>
  </>;
}
