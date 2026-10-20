import PageHeader from "@/components/site/PageHeader";
import { CompanyCta, FeatureGrid, SectionHeading } from "@/components/site/company/Sections";
import Icon from "@/components/icons";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Careers",
  description: "Join the team building the world's most useful learning companion. Open roles, culture, and life at EduPortal.",
  path: "/careers",
});
const perks = [
  { icon: <Icon.Globe size={25} />, title: "Remote-first", description: "Work from anywhere. We sync across timezones with overlap windows, not crunch." },
  { icon: <Icon.Heart size={25} />, title: "Care, by default", description: "Generous health coverage for you and your family, plus monthly wellness stipend." },
  { icon: <Icon.Sparkles size={25} />, title: "Learning budget", description: "$1,500/year for courses, books, and conferences — we eat our own cooking." },
  { icon: <Icon.Calendar size={25} />, title: "Real time off", description: "Unlimited PTO with a 4-week minimum, plus a fully paid week between holidays." },
  { icon: <Icon.TrendingUp size={25} />, title: "Meaningful equity", description: "Every full-time hire gets stock options with a 10-year exercise window." },
  { icon: <Icon.Users size={25} />, title: "Twice-yearly offsites", description: "We come together for a week of building, hiking, and a bit too much coffee." },
];
const values = [
  { title: "Default to clarity", description: "Write things down. Explain the why. If a teammate has to ask twice, we revise rather than repeat." },
  { title: "Bias to taste", description: "Quality is non-negotiable, but speed is too. We prefer iterating in public to perfecting in private." },
  { title: "Stay close to learners", description: "Every PM, engineer, and designer talks to students every month. The product follows." },
];
const roles = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Remote (UTC −5 to +5)", type: "Full-time" },
  { title: "AI / ML Researcher", team: "AI", location: "Remote", type: "Full-time" },
  { title: "Senior Product Designer", team: "Design", location: "Remote (Europe)", type: "Full-time" },
  { title: "Curriculum Lead, Data Science", team: "Curriculum", location: "Bengaluru or Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", team: "Growth", location: "Remote", type: "Full-time" },
  { title: "Student Support Specialist", team: "Operations", location: "Remote (Asia)", type: "Full-time" },
  { title: "Video Producer (Contract)", team: "Curriculum", location: "Remote", type: "Contract" },
];

export default function CareersPage() {
  return <>
    <PageHeader title="Careers" parents={[]} />
    <section className="about-three edu-company-section edu-company-lead"><div className="container"><SectionHeading eyebrow="Careers">Build the future of <span>how people learn</span></SectionHeading><p>We&apos;re a small, focused team on a mission: give every learner an AI-powered tutor that meets them where they are. If that sounds like work worth doing, come build with us.</p><div className="edu-company-actions"><a className="thm-btn" href="#open-roles"><span className="icon-angles-right" />See open roles</a><a className="thm-btn edu-company-btn-outline" href="/about"><span className="icon-angles-right" />Meet the team</a></div></div></section>
    <FeatureGrid eyebrow="Why EduPortal" title="Benefits that work in real life" intro="We don't pad the careers page. Here's what every full-time teammate actually gets." items={perks} />
    <section className="why-choose-three edu-company-section"><div className="container"><div className="row"><div className="col-lg-5"><SectionHeading eyebrow="How we work">A few things we&apos;re serious about</SectionHeading><p>These aren&apos;t posters on a wall. They&apos;re the lens we use to make hard calls — what to ship, what to delete, and who to hire next.</p></div><div className="col-lg-7"><ol className="edu-company-values">{values.map((value, i) => <li className="why-choose-three__feature-single edu-company-card" key={value.title}><span className="edu-company-values__number">0{i + 1}</span><div><h3 className="why-choose-three__feature-title">{value.title}</h3><p className="why-choose-three__feature-text">{value.description}</p></div></li>)}</ol></div></div></div></section>
    <section className="courses-one edu-company-section edu-company-roles" id="open-roles"><div className="container"><SectionHeading eyebrow="Open roles">7 ways to join</SectionHeading><p className="edu-company-roles__note">Don&apos;t see your role? <a href="/contact">Tell us anyway</a>.</p><ul className="list-unstyled edu-company-role-list">{roles.map(role => <li className="courses-one__single edu-company-role" key={role.title}><div className="edu-company-role__info"><span className="edu-company-role__team">{role.team}</span><h3 className="courses-one__title">{role.title}</h3><div className="edu-company-role__meta"><span><Icon.Globe size={16} />{role.location}</span><span><Icon.Clock size={16} />{role.type}</span></div></div><a className="thm-btn edu-company-btn-outline" href={`mailto:careers@eduportal.app?subject=Application: ${encodeURIComponent(role.title)}`}><span className="icon-angles-right" />Apply</a></li>)}</ul></div></section>
    <CompanyCta title="Don't see a fit?" text="We always want to meet people who care deeply about education. Send us a note — even if there's no open role." actions={[{ label: "careers@eduportal.app", href: "mailto:careers@eduportal.app?subject=Open%20application" }]} />
  </>;
}
