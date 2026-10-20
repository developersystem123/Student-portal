/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Pricing",
  description: "Simple, honest EduPortal pricing. Pay monthly or save 20% annually.",
  path: "/pricing",
});
const fallback = [
  { id: "free", key: "free", name: "Free", tagline: "Get started with the basics.", monthlyPrice: 0, annualPrice: 0, highlight: false, order: 0, features: ["Access to free courses", "Community forum", "Track up to 3 enrolled courses", "Limited AI chat (10/day)", "Email support"] },
  { id: "pro", key: "pro", name: "Pro", tagline: "Everything you need to master a skill.", monthlyPrice: 999, annualPrice: 9588, highlight: true, order: 1, features: ["All free features", "Unlimited AI chat & quiz generation", "Access to all paid courses", "Live class participation", "Verifiable certificates", "Offline downloads (mobile)", "Priority support"] },
  { id: "team", key: "team", name: "Team", tagline: "For study groups, families, or small teams.", monthlyPrice: 2900, annualPrice: 27840, highlight: false, order: 2, features: ["All Pro features", "Up to 5 team members", "Team progress dashboard", "Shared notes & discussions", "Admin invoicing", "Dedicated account manager"] },
];
const faq = [
  { q: "Can I cancel anytime?", a: "Yes — cancel at any time. You'll keep access until the end of your billing period." },
  { q: "Do you offer student discounts?", a: "Yes — 30% off Pro with a valid student ID. Contact us after sign-up to claim." },
  { q: "Is there a free trial?", a: "Pro includes a 14-day free trial. No credit card needed to start." },
  { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade anytime from your Subscription page." },
];
type Props = { searchParams: Promise<{ billing?: string | string[] }> };
export default async function PricingPage({ searchParams }: Props) {
  const { billing } = await searchParams;
  const annual = (Array.isArray(billing) ? billing[0] : billing) !== "monthly";
  let plans = fallback;
  try {
    const rows = await prisma.subscriptionPlan.findMany({ orderBy: { order: "asc" } });
    if (rows.length) plans = rows;
  } catch { /* Keep published plan details visible when the database is unavailable. */ }
  return (
    <>
      <PageHeader title="Pricing" />
      <section className="pricing-one pricing-page edu-pricing"><div className="container">
        <div className="section-title-two text-center"><div className="section-title-two__tagline-box"><div className="section-title-two__tagline-shape"><img src="/site/assets/images/shapes/section-title-two-shape-1.png" alt="" loading="lazy" decoding="async" /></div><span className="section-title-two__tagline">Our Pricing</span></div><h2 className="section-title-two__title">Simple, <span>honest pricing</span></h2><p>Pay monthly or save 20% annually. Cancel anytime.</p></div>
        <nav className="edu-pricing__toggle" aria-label="Billing interval"><a href="/pricing?billing=monthly" aria-current={!annual ? "page" : undefined}>Monthly</a><a href="/pricing?billing=annual" aria-current={annual ? "page" : undefined}>Annual <span>Save 20%</span></a></nav>
        <div className="row edu-pricing__plans">{plans.map(p => { const free = p.monthlyPrice === 0 && p.annualPrice === 0; const perMonth = annual ? p.annualPrice / 12 : p.monthlyPrice; return <div key={p.id} className="col-xl-4 col-lg-4 col-md-6"><div className={`pricing-one__single edu-pricing__card ${p.highlight ? "edu-pricing__card--highlight" : ""}`}>
          {p.highlight && <span className="edu-pricing__popular">Most popular</span>}
          <h3 className="pricing-one__package-name">{p.name}</h3><p className="edu-pricing__tagline">{p.tagline}</p><div className="pricing-one__price-box"><h3>${(perMonth / 100).toFixed(2)}</h3><p>/month</p></div>{annual && !free && <p className="edu-pricing__bill">${(p.annualPrice / 100).toFixed(2)} billed annually</p>}
          <ul className="list-unstyled pricing-one__feature">{p.features.map(f => <li key={f}><span className="fas fa-check" aria-hidden="true" /> {f}</li>)}</ul>
          <div className="pricing-one__btn-box"><a href={free ? "/register" : "/subscription"} className="thm-btn"><span className="icon-angles-right" />{free ? "Sign up free" : `Get ${p.name}`}</a></div>
        </div></div>; })}</div>
        <div className="edu-pricing__enterprise"><span className="icon-users" aria-hidden="true" /><div><h3>Enterprise &amp; Universities</h3><p>Bulk licensing, custom branding, SSO, and content licensing. Volume discounts available.</p></div><a href="/contact" className="thm-btn-two"><span>Contact sales</span><i className="icon-angles-right" /></a></div>
      </div></section>
      <section className="faq-page edu-pricing__faq"><div className="container"><div className="section-title-two text-center"><span className="section-title-two__tagline">Help with pricing</span><h2 className="section-title-two__title">Pricing questions</h2></div><div className="row"><div className="col-xl-6 col-lg-6"><div className="faq-page__left"><div className="accrodion-grp faq-one-accrodion" data-grp-name="edu-pricing-faq-left">{faq.slice(0, 2).map(f => <div className="accrodion" key={f.q}><div className="accrodion-title"><h4 aria-level={3}>{f.q}</h4></div><div className="accrodion-content"><div className="inner"><p>{f.a}</p></div></div></div>)}</div></div></div><div className="col-xl-6 col-lg-6"><div className="faq-page__right"><div className="accrodion-grp faq-one-accrodion" data-grp-name="edu-pricing-faq-right">{faq.slice(2).map(f => <div className="accrodion" key={f.q}><div className="accrodion-title"><h4 aria-level={3}>{f.q}</h4></div><div className="accrodion-content"><div className="inner"><p>{f.a}</p></div></div></div>)}</div></div></div></div><p className="edu-pricing__more">More questions? <a href="/faq">Visit our FAQ</a></p></div></section>
    </>
  );
}
