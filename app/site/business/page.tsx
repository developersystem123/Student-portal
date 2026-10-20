import PageHeader from "@/components/site/PageHeader";
import { CompanyCta, FeatureGrid, SectionHeading } from "@/components/site/company/Sections";
import Icon from "@/components/icons";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "For Business",
  description: "Upskill your whole team with EduPortal for Business. Curated learning paths, AI tutoring, and admin reporting in one platform.",
  path: "/business",
});
const features = [
  { icon: <Icon.Users size={25} />, title: "Unlimited seats", description: "Bring 5 or 5,000 teammates. Invite them by email or sync via SCIM with one click." },
  { icon: <Icon.ListChecks size={25} />, title: "Custom learning paths", description: "Bundle our courses (or your own) into role-specific paths for engineering, ops, sales, and more." },
  { icon: <Icon.MessageSquare size={25} />, title: "Private AI tutor", description: "Your team's AI tutor stays inside your workspace and can be trained on your internal docs." },
  { icon: <Icon.PieChart size={25} />, title: "Admin reporting", description: "Track engagement, completion, and skill growth — export to your HRIS or LMS in one click." },
  { icon: <Icon.Lock size={25} />, title: "SSO & SCIM", description: "Okta, Google, Azure AD — plus role-based access control and audit logs for compliance teams." },
  { icon: <Icon.Award size={25} />, title: "Co-branded certificates", description: "Issue certificates with your logo alongside ours, on completion of any path." },
];
const useCases = [
  { icon: <Icon.Sparkles size={25} />, title: "Engineering onboarding", description: "Get new hires productive in 30 days with role-specific paths covering your stack, codebase patterns, and team rituals." },
  { icon: <Icon.TrendingUp size={25} />, title: "Continuous upskilling", description: "Quarterly skill paths keep your team ahead of the curve. AI assesses gaps and recommends what to learn next." },
  { icon: <Icon.CheckCircle size={25} />, title: "Compliance & certification", description: "Roll out mandatory training (security, accessibility, privacy) with deadline tracking and audit-ready logs." },
];
const compare = [
  { label: "Seats", team: "Up to 5", business: "Unlimited" }, { label: "All courses", team: "Yes", business: "Yes + custom" },
  { label: "AI tutor", team: "Standard", business: "Private, trainable" }, { label: "Admin reporting", team: "Basic", business: "Advanced + export" },
  { label: "SSO / SCIM", team: "—", business: "Included" }, { label: "Custom paths", team: "—", business: "Unlimited" },
  { label: "Dedicated CSM", team: "—", business: "Yes" }, { label: "SLA & priority support", team: "—", business: "24/7" },
];
const customers = [
  { name: "Lumenstack", quote: "Onboarding time dropped from 6 weeks to 19 days.", person: "Director of Eng" },
  { name: "Northwind Labs", quote: "90% of our engineers finished the security path in month one.", person: "CISO" },
  { name: "Helio Pay", quote: "The AI tutor handles questions our internal docs never could.", person: "Head of People" },
];

export default function BusinessPage() {
  return <>
    <PageHeader title="For Business" parents={[]} />
    <section className="about-three edu-company-section edu-company-business-hero"><div className="container"><div className="row edu-company-align"><div className="col-lg-6"><SectionHeading eyebrow="EduPortal for Business">Skill up your <span>entire team</span> in one place</SectionHeading><p className="about-three__text-1">The same AI-powered learning platform individuals love — now with admin controls, custom paths, and SSO. Trusted by teams from 10 to 10,000.</p><div className="edu-company-actions"><a href="/contact?reason=Partnership" className="thm-btn"><span className="icon-angles-right" />Talk to sales</a><a href="/pricing" className="thm-btn edu-company-btn-outline"><span className="icon-angles-right" />See pricing</a></div><p className="edu-company-trusted">Trusted by teams at</p><p>Lumenstack · Northwind Labs · Helio Pay · Atrius · Pinepoint</p></div>
      <div className="col-lg-6"><div className="pricing-one__single edu-company-dashboard"><div className="edu-company-dashboard__head"><div><small>Team dashboard</small><h3>Engineering · Q2 2026</h3></div><span>Active</span></div><div className="edu-company-dashboard__metrics"><div><small>Seats</small><strong>128</strong></div><div><small>Active</small><strong>94%</strong></div><div><small>Hours</small><strong>1,204</strong></div></div><div className="edu-company-dashboard__paths">{[{ name: "Backend onboarding", progress: 86 }, { name: "AWS fundamentals", progress: 62 }, { name: "Security 101", progress: 100 }, { name: "React in depth", progress: 41 }].map(path => <div key={path.name}><div className="edu-company-dashboard__label"><span>{path.name}</span><span>{path.progress}%</span></div><div className="edu-company-dashboard__track" role="meter" aria-label={path.name} aria-valuenow={path.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${path.progress}%` }} /></div></div>)}</div></div></div>
    </div></div></section>
    <FeatureGrid eyebrow="What you get" title="Everything your team needs to learn" items={features} />
    <FeatureGrid eyebrow="Common use cases" title="How teams use EduPortal" items={useCases} />
    <section className="pricing-one pricing-page edu-company-section edu-company-compare"><div className="container"><SectionHeading eyebrow="Plans" center>Team vs. Business</SectionHeading><p className="edu-company-intro">Most teams under 5 do great on the Team plan. Need more? Business unlocks the full stack.</p><div className="edu-company-table-wrap" role="region" aria-label="Team and Business plan comparison" tabIndex={0}><table className="edu-company-table"><thead><tr><th scope="col">Feature</th><th scope="col">Team ($29/mo)</th><th scope="col">Business</th></tr></thead><tbody>{compare.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.team}</td><td>{row.business}</td></tr>)}</tbody></table></div></div></section>
    <section className="testimonials-page edu-company-section edu-company-business-stories"><div className="container"><SectionHeading eyebrow="Customer stories" center>Teams shipping faster</SectionHeading><div className="row edu-company-grid">{customers.map(customer => <div className="col-lg-4" key={customer.name}><div className="testimonial-three__single edu-company-story"><div className="testimonial-three__rating" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, i) => <span className="icon-star" key={i} />)}</div><p className="testimonial-three__text">“{customer.quote}”</p><div className="testimonial-three__client-content"><h3 className="testimonial-three__client-name">{customer.name}</h3><p className="testimonial-three__client-sub-title">{customer.person}</p></div></div></div>)}</div></div></section>
    <CompanyCta title="Ready to upskill your team?" text="Book a 30-minute call. We'll show you the admin console, scope your needs, and have you live in a week or less." actions={[{ label: "Talk to sales", href: "/contact?reason=Partnership" }, { label: "Email us", href: "mailto:sales@eduportal.app" }]} />
  </>;
}
