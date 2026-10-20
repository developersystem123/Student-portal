/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import SectionTitle from "@/components/site/forms/SectionTitle";
import ApplicationForm from "@/components/site/forms/ApplicationForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Become a Teacher",
  description: "Teach on EduPortal. Share your expertise with learners worldwide, build courses with our studio tools, and earn revenue share.",
  path: "/teach",
});
const benefits = [
  ["fas fa-chart-line", "Earn up to 70%", "Industry-leading revenue share. Keep more of what you make on every enrollment."],
  ["fas fa-users", "Reach 48,000+ learners", "Tap into an engaged global audience actively looking for what you teach."],
  ["fas fa-magic", "AI-assisted authoring", "Auto-generate quizzes, transcripts, and study guides. Spend more time teaching, less editing."],
  ["fas fa-award", "Verifiable credentials", "Your students earn certificates that carry your name and link back to your profile."],
  ["fas fa-chart-pie", "Real-time analytics", "See where learners thrive, where they drop off, and what to improve — for every chapter."],
  ["fas fa-heart", "Dedicated success team", "Onboarding coach, launch reviews, and a private community of fellow instructors."],
];
const steps = [
  ["01", "Apply", "Share your background, topic, and a short outline. Approvals usually take 3–5 days."],
  ["02", "Build with us", "Use our authoring studio, recording guides, and editor support to ship a polished course."],
  ["03", "Launch & grow", "We co-promote your launch, then keep the funnel flowing — newsletters, recommendations, and SEO."],
];
const earnings = [
  ["100 students/mo", "$700/mo", "$9.99 course"],
  ["500 students/mo", "$3,500/mo", "$9.99 course"],
  ["1,000 students/mo", "$14,000/mo", "$19.99 course"],
];
const faqs = [
  ["What kinds of courses can I create?", "Anything we don't already cover deeply: programming, design, business, data, languages, creative skills, soft skills. If you can teach it well, there's likely an audience for it."],
  ["What equipment do I need?", "A decent USB mic, a quiet room, and your laptop. We provide a recording guide, lighting suggestions, and slide templates. Editing is included in our authoring studio."],
  ["How long does a course take to build?", "Most instructors ship their first 3–5 hour course in 6–10 weeks. We pair you with an editor to keep things moving."],
  ["When and how do I get paid?", "Monthly payouts on the 5th, via Stripe, PayPal, or wire — to 180+ countries. You can track earnings in real time from your instructor dashboard."],
];

export default function TeachPage() {
  return <>
    <PageHeader title="Become a Teacher" parents={[]} />
    <section className="become-a-teacher edu-teach">
      <div className="container">
        <div className="become-a-teacher__top">
          <SectionTitle eyebrow="Now accepting Spring 2026 instructors" center>Turn your expertise into a <span>thriving course</span></SectionTitle>
          <div className="become-a-teacher__content"><p>Whether you&apos;ve taught for years or want to share what you know for the first time, EduPortal gives you the tools, audience, and AI assist to do it well.</p></div>
          <div className="become-a-teacher__tab-box">
            <nav className="tab-buttons list-unstyled edu-teach-tabs" aria-label="Instructor opportunities">
              <a className="tab-btn" href="#benefits"><span>Why teach with us</span></a>
              <a className="tab-btn" href="#how-it-works"><span>How it works</span></a>
              <a className="tab-btn" href="#apply"><span>Apply to teach</span></a>
            </nav>
          </div>
          <div className="edu-teach-proof"><span><i className="fas fa-check" aria-hidden="true" /> Free to apply</span><span><i className="fas fa-check" aria-hidden="true" /> No exclusivity</span></div>
        </div>
        <div className="become-a-teacher__bottom" id="apply"><div className="row">
          <div className="col-xl-4"><div className="become-a-teacher__img-box"><div className="become-a-teacher__img">
            <img src="/site/assets/images/edu/edu-art-teach-studio.png" alt="An instructor recording a lesson with a camera and microphone, with course analytics behind them" loading="lazy" decoding="async" />
          </div></div><div className="edu-teach-highlight"><strong>$2.4M+</strong><span>paid to instructors last year</span><div><span>Top earner <b>$184k</b></span><span>Avg. rating <b>4.7 ★</b></span></div></div></div>
          <div className="col-xl-8"><div className="become-a-teacher__right">
            <SectionTitle eyebrow="Apply">Tell us what you&apos;d teach</SectionTitle>
            <p className="edu-form-intro">We review every application. Be specific — a clear pitch beats a long résumé. We&apos;ll get back within 3–5 business days.</p>
            <ApplicationForm kind="teach" />
          </div></div>
        </div></div>
      </div>
    </section>
    <section id="benefits" className="edu-feature-section"><div className="container">
      <SectionTitle eyebrow="What you get" center>Built for instructors who care</SectionTitle>
      <div className="row edu-feature-grid">{benefits.map(([icon, title, description]) => <div className="col-lg-4 col-md-6" key={title}><div className="contact-two__single edu-feature-card">
        <div className="contact-two__icon"><i className={icon} aria-hidden="true" /></div><h3 className="contact-two__title">{title}</h3><p>{description}</p>
      </div></div>)}</div>
    </div></section>
    <section id="how-it-works" className="edu-feature-section edu-section-alt"><div className="container">
      <SectionTitle eyebrow="How it works" center>From idea to launch in three steps</SectionTitle>
      <div className="row edu-feature-grid">{steps.map(([number, title, description]) => <div className="col-md-4" key={number}><div className="edu-process-card"><span className="edu-process-number">{number}</span><h3>{title}</h3><p>{description}</p></div></div>)}</div>
    </div></section>
    <section className="edu-feature-section"><div className="container">
      <SectionTitle eyebrow="Earnings potential" center>What you could make</SectionTitle>
      <p className="edu-section-description">Estimates at our 70% revenue share. Actual earnings depend on pricing, traffic, and reviews.</p>
      <div className="row edu-feature-grid">{earnings.map(([label, amount, price]) => <div className="col-md-4" key={label}><div className="pricing-one__single edu-earning-card"><p>{label}</p><div className="pricing-one__price-box"><h3>{amount}</h3></div><p>at {price}</p></div></div>)}</div>
    </div></section>
    <section className="faq-page edu-faq-section edu-section-alt"><div className="container">
      <SectionTitle eyebrow="Instructor FAQ" center>Common questions</SectionTitle>
      <div className="row edu-faq-row">{faqs.map(([q, a]) => <div className="col-lg-6" key={q}><details className="edu-accordion"><summary>{q}</summary><div className="edu-accordion-answer"><p>{a}</p></div></details></div>)}</div>
    </div></section>
  </>;
}
