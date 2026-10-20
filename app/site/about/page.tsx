/* eslint-disable @next/next/no-img-element */
import PageHeader from "@/components/site/PageHeader";
import { CompanyCta, FeatureGrid, SectionHeading, Stats } from "@/components/site/company/Sections";
import Icon from "@/components/icons";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description: "EduPortal blends expert-led courses with AI tutoring, so students learn faster, deeper, and at their own pace.",
  path: "/about",
});
const values = [
  { title: "Learners first", description: "Every product decision starts with one question: does this help a student actually learn?", icon: <Icon.Sparkles size={25} /> },
  { title: "Mastery over memorization", description: "We design for understanding — not for quick wins that fade after the test.", icon: <Icon.TrendingUp size={25} /> },
  { title: "Honest credentials", description: "Certificates that mean something, because they reflect real, verifiable progress.", icon: <Icon.Award size={25} /> },
];
const team = [
  { name: "Ananya Sharma", role: "Co-founder, Curriculum", initials: "AS" },
  { name: "Rohan Verma", role: "Co-founder, Engineering", initials: "RV" },
  { name: "Maya Patel", role: "Head of Design", initials: "MP" },
  { name: "Karan Mehta", role: "Head of Growth", initials: "KM" },
];

export default function AboutPage() {
  return <>
    <PageHeader title="About EduPortal" parents={[]} />
    <section className="about-three edu-company-about">
      <div className="about-three__shape-2 rotate-me" /><div className="about-three__shape-4 float-bob-y" />
      <div className="container"><div className="row edu-company-align">
        <div className="col-xl-7"><div className="about-three__left">
          <div className="about-three__shape-1 img-bounce"><img src="/site/assets/images/shapes/about-three-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
          <div className="about-three__img-box"><div className="about-three__img-one"><img src="/site/assets/images/edu/edu-art-about-graduate.png" alt="A graduate holding an EduPortal certificate at the end of their learning journey" loading="lazy" decoding="async" /></div><div className="about-three__img-two"><img src="/site/assets/images/edu/edu-about-path.png" alt="A learning path with completed, in-progress and upcoming milestones" loading="lazy" decoding="async" /></div></div>
        </div></div>
        <div className="col-xl-5"><div className="about-three__right">
          <SectionHeading eyebrow="About EduPortal">We&apos;re building the most useful <span>learning companion</span> in the world.</SectionHeading>
          <p className="about-three__text-1">EduPortal started as a tiny experiment: what if every student had a patient, brilliant tutor available 24/7? Today, we combine carefully crafted courses with AI assistance to make that real — for anyone, anywhere.</p>
          <div className="about-three__mission-vission edu-company-mission"><h3>Our mission</h3><h4>Make great learning feel inevitable</h4>
            <p>Quality education is still gated by geography, cost, and confidence. We&apos;re tearing those walls down. Our platform pairs world-class instructors with an AI that adapts to how <em>you</em> learn — so progress stops feeling rare and starts feeling routine.</p>
            <p>We believe motivation is downstream of clarity. When a concept clicks, you keep going. EduPortal is engineered for those clicks.</p>
          </div>
        </div></div>
      </div></div>
    </section>
    <Stats items={[{ value: "48k+", label: "Active learners" }, { value: "120+", label: "Expert courses" }, { value: "92%", label: "Completion rate" }, { value: "4.8", label: "Avg. rating" }]} />
    <section className="why-choose-three edu-company-section edu-company-philosophy"><div className="container"><div className="row edu-company-align"><div className="col-lg-6"><SectionHeading eyebrow="Our philosophy">Learning that <span>clicks</span></SectionHeading><p className="why-choose-three__text-1">Our instructors and AI tutor work together to bring clarity to every lesson, at every pace.</p></div><div className="col-lg-6"><blockquote className="why-choose-three__ceo-speech edu-company-quote"><p>“The best teacher is the one who&apos;s patient enough to explain it twice.”</p><footer>— EduPortal philosophy</footer></blockquote></div></div></div></section>
    <FeatureGrid eyebrow="What we value" title="Principles that guide our work" items={values} />
    <section className="team-one edu-company-section edu-company-team"><div className="container"><SectionHeading eyebrow="The team">Built by educators and engineers</SectionHeading><div className="row edu-company-grid">
      {team.map(member => <div className="col-xl-3 col-md-6" key={member.name}><div className="team-one__single edu-company-team__card"><div className="team-one__img-box edu-company-team__img"><span aria-hidden="true">{member.initials}</span></div><div className="team-one__content edu-company-team__content"><h3 className="team-one__title">{member.name}</h3><p className="team-one__sub-title">{member.role}</p></div></div></div>)}
    </div></div></section>
    <CompanyCta title="Come learn with us" text="Whether you're leveling up your career or curious about something new, there's a path here for you." actions={[{ label: "Get started free", href: "/register" }, { label: "Browse courses", href: "/courses" }]} />
  </>;
}
