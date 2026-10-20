import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import SectionTitle from "@/components/site/forms/SectionTitle";
import ApplicationForm from "@/components/site/forms/ApplicationForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Affiliate Program",
  description: "Earn 30% recurring commission for every Pro subscription you refer. Join the EduPortal affiliate program and get paid for the learners you bring.",
  path: "/affiliate",
});
const perks = [
  ["fas fa-chart-line", "30% recurring commission", "For every Pro subscription you refer, you earn 30% — for as long as they stay subscribed."],
  ["far fa-clock", "60-day cookie window", "Plenty of time between click and signup. We attribute fairly across devices."],
  ["fas fa-award", "Tiered bonuses", "Hit 25, 50, or 100 referrals/quarter and unlock bonus payouts and exclusive perks."],
  ["fas fa-chart-pie", "Real-time dashboard", "Track clicks, signups, and earnings with UTM-level insights and downloadable reports."],
  ["fas fa-paper-plane", "Creative kit", "Banners, social cards, demo videos, and copy templates — refreshed every quarter."],
  ["fas fa-envelope", "Dedicated affiliate manager", "Once you hit 50 referrals/quarter, get a direct line to a real human at EduPortal."],
];
const audiences = [
  ["fas fa-video", "Creators & educators", "YouTubers, newsletter writers, course teachers — your audience already trusts your recs."],
  ["fas fa-users", "Communities & forums", "Discord admins, subreddit mods, Slack workspace owners — give your community a member perk."],
  ["fas fa-globe", "Bloggers & SEO sites", "Review sites, tutorial blogs, comparison guides — we'll provide everything you need to rank."],
];
const tiers = [
  { name: "Starter", min: "0", perks: ["30% recurring", "60-day cookie", "Creative kit"] },
  { name: "Plus", min: "25", perks: ["All Starter perks", "+5% bonus on Pro annual", "Affiliate Slack access"] },
  { name: "Elite", min: "100", perks: ["All Plus perks", "+10% bonus + custom UTMs", "Co-marketing slots", "Direct manager"] },
];
const faqs = [
  ["Who can join the program?", "Anyone with an audience — creators, educators, bloggers, community admins. We approve based on alignment with our learner community."],
  ["When do I get paid?", "Monthly payouts on the 15th, via Stripe, PayPal, or wire. Minimum payout is $50; balances roll over."],
  ["Can I promote on paid ads?", "Yes, with restrictions — no bidding on EduPortal-branded keywords, no incentivized clicks. Full policy is in the affiliate agreement."],
  ["Do you support multi-language audiences?", "Yes! Our platform serves learners in 30+ countries. Localized landing pages are available in 8 languages today."],
];
const projections = [
  ["10 referrals/mo", "$359/mo"], ["50 referrals/mo", "$1,798/mo"],
  ["100 referrals/mo", "$3,597/mo"], ["250 referrals/mo", "$8,992/mo"],
];

export default function AffiliatePage() {
  return <>
    <PageHeader title="Affiliate Program" parents={[]} />
    <section className="become-a-teacher edu-affiliate"><div className="container">
      <div className="become-a-teacher__top">
        <SectionTitle eyebrow="Affiliate program" center>Earn while you <span>share what you love</span></SectionTitle>
        <div className="become-a-teacher__content"><p>Tell your audience about EduPortal and earn 30% recurring commission on every Pro subscription. Honest tools, generous payouts, no hard sells.</p></div>
        <div className="become-a-teacher__tab-box"><nav className="tab-buttons list-unstyled edu-teach-tabs" aria-label="Affiliate program">
          <a className="tab-btn" href="#how-it-works"><span>Why join</span></a>
          <a className="tab-btn" href="#tiers"><span>Commission tiers</span></a>
          <a className="tab-btn" href="#apply"><span>Join the program</span></a>
        </nav></div>
      </div>
      <div className="edu-affiliate-projections">
        <SectionTitle eyebrow="Earnings simulator" center>See what&apos;s possible</SectionTitle>
        <div className="row">{projections.map(([label, amount]) => <div className="col-lg-3 col-sm-6" key={label}>
          <div className="pricing-one__single edu-earning-card"><p>{label}</p><div className="pricing-one__price-box"><h3>{amount}</h3></div><p>After year 1</p></div>
        </div>)}</div>
        <p>Assumes Pro plan at $9.99/mo, average 12-month retention, no annual upgrades.</p>
      </div>
    </div></section>
    <section id="how-it-works" className="edu-feature-section edu-section-alt"><div className="container">
      <SectionTitle eyebrow="Why join" center>A program built for serious creators</SectionTitle>
      <div className="row edu-feature-grid">{perks.map(([icon, title, description]) => <div className="col-lg-4 col-md-6" key={title}><div className="contact-two__single edu-feature-card">
        <div className="contact-two__icon"><i className={icon} aria-hidden="true" /></div><h3 className="contact-two__title">{title}</h3><p>{description}</p>
      </div></div>)}</div>
    </div></section>
    <section className="edu-feature-section"><div className="container">
      <SectionTitle eyebrow="Who it's for" center>Built for these creators</SectionTitle>
      <div className="row edu-feature-grid">{audiences.map(([icon, title, description]) => <div className="col-md-4" key={title}><div className="contact-two__single edu-feature-card">
        <div className="contact-two__icon"><i className={icon} aria-hidden="true" /></div><h3 className="contact-two__title">{title}</h3><p>{description}</p>
      </div></div>)}</div>
    </div></section>
    <section id="tiers" className="edu-feature-section edu-section-alt"><div className="container">
      <SectionTitle eyebrow="Tiers" center>The more you refer, the more you earn</SectionTitle>
      <div className="row edu-feature-grid">{tiers.map((tier) => <div className="col-md-4" key={tier.name}><div className="pricing-one__single edu-tier-card">
        <h3 className="pricing-one__package-name">{tier.name}</h3>
        <div className="pricing-one__price-box"><h3>{tier.min}+</h3><p>referrals/quarter</p></div>
        <ul className="pricing-one__feature list-unstyled">{tier.perks.map((perk) => <li key={perk}><i className="fas fa-check-circle" aria-hidden="true" /> {perk}</li>)}</ul>
      </div></div>)}</div>
    </div></section>
    <section id="apply" className="become-a-teacher edu-affiliate-apply"><div className="container"><div className="row">
      <div className="col-lg-4"><SectionTitle eyebrow="Apply">Get your unique link</SectionTitle><p>Tell us about your audience. We review and approve most applications within 2–3 business days. No upfront fees, no minimums to start.</p></div>
      <div className="col-lg-8"><div className="become-a-teacher__right"><ApplicationForm kind="affiliate" /></div></div>
    </div></div></section>
    <section className="faq-page edu-faq-section edu-section-alt"><div className="container">
      <SectionTitle eyebrow="Affiliate FAQ" center>Common questions</SectionTitle>
      <div className="row edu-faq-row">{faqs.map(([q, a]) => <div className="col-lg-6" key={q}><details className="edu-accordion"><summary>{q}</summary><div className="edu-accordion-answer"><p>{a}</p></div></details></div>)}</div>
    </div></section>
  </>;
}
