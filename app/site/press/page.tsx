/* eslint-disable @next/next/no-img-element */
import PageHeader from "@/components/site/PageHeader";
import { blogCover } from "@/components/site/illustrations";
import { CompanyCta, SectionHeading } from "@/components/site/company/Sections";
import Icon from "@/components/icons";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Press & Media",
  description: "Press releases, media kit, brand assets, and contact info for journalists, podcasters, and partners covering EduPortal.",
  path: "/press",
});
const releases = [
  { date: "2026-04-22", title: "EduPortal closes $42M Series B to bring AI-powered tutoring to 10M students", excerpt: "The round is led by Pinepoint Ventures with participation from Lumina Capital and existing investors. Funds will accelerate curriculum, AI safety research, and expansion into Latin America and Southeast Asia." },
  { date: "2026-03-08", title: "EduPortal launches Verified Career Tracks, a job-aligned learning path", excerpt: "Career Tracks pair our courses with industry mentors and a portfolio capstone, designed so graduates can apply to entry-level roles immediately. Launch partners include Stripe, Atlassian, and Figma." },
  { date: "2026-01-17", title: "EduPortal partners with the IIT system to bring AI study tools to 28,000 students", excerpt: "Students at all 23 IITs will get free Pro access for the 2026 academic year. The partnership also opens a research collaboration on AI-supported learning outcomes." },
  { date: "2025-11-04", title: "EduPortal hits 1 million active monthly learners", excerpt: "Just 30 months after launch, EduPortal crosses the 1M monthly active learner mark. Top growth markets include India, Brazil, Nigeria, and Indonesia." },
  { date: "2025-08-19", title: "New AI Quiz Generator turns any topic into a personalized practice set", excerpt: "Our most-requested feature: convert any topic, link, or PDF into an interactive quiz tailored to your level. Available to all Pro members today." },
];
const mentions = [
  { outlet: "TechCrunch", headline: "EduPortal is rewriting how the world studies", date: "2026-04-23" },
  { outlet: "The Verge", headline: "Inside EduPortal's bet that AI tutors really can teach", date: "2026-03-12" },
  { outlet: "WIRED", headline: "When the textbook can talk back: AI in classrooms", date: "2026-02-04" },
  { outlet: "Forbes", headline: "The 30 EdTech companies to watch in 2026", date: "2026-01-29" },
  { outlet: "Bloomberg", headline: "EdTech's quiet comeback, led by AI-first platforms", date: "2025-12-11" },
];
const facts = [
  { label: "Founded", value: "2023" }, { label: "Headquarters", value: "Bengaluru, India" },
  { label: "Team size", value: "84 across 17 countries" }, { label: "Monthly learners", value: "1.2M+" },
  { label: "Courses", value: "320+ across 18 categories" }, { label: "Funding to date", value: "$57M" },
];
function formatDate(date: string) { return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }); }

export default function PressPage() {
  return <>
    <PageHeader title="Press & Media" parents={[]} />
    <section className="about-three edu-company-section edu-company-lead"><div className="container"><SectionHeading eyebrow="Press & Media">Resources for <span>journalists</span> &amp; partners.</SectionHeading><p>Reporting on EduPortal? Working on a story about AI and education? Here&apos;s everything you need — announcements, facts, and approved brand assets.</p><div className="edu-company-actions"><a className="thm-btn" href="mailto:press@eduportal.app"><span className="icon-angles-right" />press@eduportal.app</a><a className="thm-btn edu-company-btn-outline" href="#assets"><span className="icon-angles-right" />Brand assets</a></div></div></section>
    <section className="counter-one edu-company-section edu-company-facts"><div className="container"><SectionHeading eyebrow="Company fact sheet">Quick facts</SectionHeading><a className="edu-company-facts__link" href="mailto:press@eduportal.app?subject=Fact%20sheet%20(PDF)%20request">Request fact sheet (PDF)</a><div className="row edu-company-grid">{facts.map(fact => <div className="col-lg-4 col-sm-6" key={fact.label}><div className="edu-company-fact"><span>{fact.label}</span><strong>{fact.value}</strong></div></div>)}</div></div></section>
    {/* The newest release is featured full-width and the other four share one even row, so five releases
        never leave a lone card. Tag and date sit in a plain meta line under the image. */}
    <section className="blog-page edu-company-press-blog"><div className="container"><SectionHeading eyebrow="Announcements">Latest from EduPortal</SectionHeading><div className="row edu-company-releases">{releases.map((release, i) => <div className={i === 0 ? "col-12" : "col-xl-3 col-md-6"} key={release.title}><article className={`edu-company-release${i === 0 ? " edu-company-release--featured" : ""}`}><div className="edu-company-release__img"><img src={blogCover(i)} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" /></div><div className="edu-company-release__body"><p className="edu-company-release__meta"><span className="edu-company-release__tag">Press release</span><time dateTime={release.date}>{formatDate(release.date)}</time></p><h3 className="edu-company-release__title">{release.title}</h3><p className="edu-company-release__text">{release.excerpt}</p><a className="edu-company-text-link" href="mailto:press@eduportal.app?subject=Full%20release%20request">Request full release <span className="icon-angles-right" aria-hidden="true" /></a></div></article></div>)}</div></div></section>
    <section className="blog-page edu-company-section edu-company-soft"><div className="container"><SectionHeading eyebrow="In the news">Recent coverage</SectionHeading><ul className="edu-company-mentions list-unstyled">{mentions.map(mention => <li className="edu-company-mention" key={mention.outlet}><strong className="edu-company-mention__outlet">{mention.outlet}</strong><p className="edu-company-mention__headline">“{mention.headline}”</p><time dateTime={mention.date}>{formatDate(mention.date)}</time></li>)}</ul></div></section>
    <section id="assets" className="about-three edu-company-section"><div className="container"><div className="row edu-company-align"><div className="col-lg-6"><SectionHeading eyebrow="Brand assets">Logos, colors, and screenshots</SectionHeading><p>Use our wordmark and logo at full color or single-color. Don&apos;t recolor, distort, or place on low-contrast backgrounds. Please keep our name as a single word: <strong>EduPortal</strong>.</p><div className="edu-company-actions"><a className="thm-btn" href="mailto:press@eduportal.app?subject=Brand%20kit%20request"><span className="icon-angles-right" />Request brand kit (ZIP)</a><a className="thm-btn edu-company-btn-outline" href="mailto:press@eduportal.app?subject=Screenshot%20pack%20request"><span className="icon-angles-right" />Product screenshots</a></div></div><div className="col-lg-6"><div className="edu-company-brand-preview"><Icon.Logo size={72} /><strong>EduPortal</strong><span>Learn · Build · Grow</span></div></div></div></div></section>
    <CompanyCta title="Working on a story?" text="We respond to most press inquiries within 24 hours. For interviews with our founders or product team, please include your outlet, deadline, and topic." actions={[{ label: "press@eduportal.app", href: "mailto:press@eduportal.app" }, { label: "Use contact form", href: "/contact?reason=Press" }]} />
  </>;
}
