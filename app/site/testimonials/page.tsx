/* eslint-disable @next/next/no-img-element */
import PageHeader from "@/components/site/PageHeader";
import { CompanyCta, SectionHeading, Stats } from "@/components/site/company/Sections";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Student Stories",
  description: "What our learners say about EduPortal.",
  path: "/testimonials",
});
const featured = { name: "Priya Anand", role: "Software Engineer, Razorpay", cohort: "Web Dev Bootcamp '25", quote: "Six months ago I was an accountant teaching myself JavaScript on weekends. Today I'm a software engineer at a company I admired from afar. EduPortal didn't just teach me to code — the AI tutor felt like a patient senior dev on call 24/7." };
const stories = [
  { name: "Aman Khan", role: "Junior Data Analyst", cohort: "Data Science Path", rating: 5, quote: "The Python + pandas track is the best I've taken — and I tried three. Real datasets, real problems, instant AI feedback when I got stuck. Got my first analyst role two weeks after finishing." },
  { name: "Sara Mehmood", role: "Product Designer", cohort: "UI/UX Foundations", rating: 5, quote: "Coming from graphic design, I thought UX would be a small leap. The structured curriculum showed me how big the gap was — and how to close it. The portfolio reviews changed my whole approach." },
  { name: "Tanay Joshi", role: "Bootcamp Grad → Frontend Dev", cohort: "React Advanced", rating: 5, quote: "Live classes were a game-changer. Asking questions in real-time and seeing other people's solutions taught me more than any tutorial." },
  { name: "Hira Sheikh", role: "Marketing Manager", cohort: "Digital Marketing", rating: 4, quote: "I was nervous about going back to learn at 35 with a full-time job. Self-paced + the schedule reminders kept me on track. Got promoted within 4 months of completion." },
  { name: "Daniyal Ahmed", role: "Self-taught Developer", cohort: "Full-Stack Path", rating: 5, quote: "I quit my job to learn full-time. The Pro plan paid for itself in week one — unlimited AI tutoring meant I never got stuck for more than 10 minutes." },
  { name: "Ayesha Malik", role: "Math Teacher", cohort: "Math for Educators", rating: 5, quote: "As a teacher, I'm picky about pedagogy. EduPortal's instructors actually understand how people learn — not just how to do the thing." },
  { name: "Faizan Iqbal", role: "Business Analyst", cohort: "Excel & SQL", rating: 4, quote: "I just wanted to level up my SQL. Ended up taking 3 more courses because the platform is so good. Worth it." },
  { name: "Mishaal Raza", role: "High School Student", cohort: "Intro to Programming", rating: 5, quote: "My school didn't offer CS. I learned Python here in 11th grade and won my first hackathon a year later. Forever grateful." },
];

export default function TestimonialsPage() {
  return <>
    <PageHeader title="Student Stories" parents={[]} />
    <section className="edu-company-section edu-company-lead"><div className="container"><SectionHeading eyebrow="Student Stories" center>Real outcomes from <span>real learners</span></SectionHeading><p className="edu-company-intro">Career switches, salary jumps, first jobs, side projects. Here&apos;s what our community has built.</p></div></section>
    <Stats items={[{ value: "94%", label: "Would recommend to a friend" }, { value: "4.8", label: "Average course rating" }, { value: "65%", label: "Land role within 6 months" }, { value: "48k+", label: "Active learners" }]} />
    <section className="testimonial-two edu-company-section"><div className="container"><SectionHeading eyebrow="Featured story">Meet Priya Anand</SectionHeading><div className="row edu-company-align"><div className="col-lg-5"><div className="edu-company-featured__image"><img src="/site/assets/images/edu/edu-art-story-growth.png" alt="A student celebrating as their progress chart climbs and they earn a star badge" loading="lazy" decoding="async" /></div></div><div className="col-lg-7"><div className="testimonial-three__single edu-company-featured__quote"><p className="testimonial-three__text">“{featured.quote}”</p><div className="testimonial-three__client-info"><div className="edu-company-avatar" aria-hidden="true">PA</div><div className="testimonial-three__client-content"><h3 className="testimonial-three__client-name">{featured.name}</h3><p className="testimonial-three__client-sub-title">{featured.role} · {featured.cohort}</p></div></div></div></div></div></div></section>
    <section className="testimonials-page edu-company-testimonials"><div className="container"><SectionHeading eyebrow="More stories">More stories from our learners</SectionHeading><div className="row">{stories.map(story => <div className="col-lg-6 col-md-6" key={story.name}><article className="testimonial-three__single edu-company-story"><div className="testimonial-three__rating" role="img" aria-label={`${story.rating} out of 5 stars`}>{Array.from({ length: story.rating }, (_, i) => <span className="icon-star" key={i} />)}</div><p className="testimonial-three__text">“{story.quote}”</p><div className="testimonial-three__client-info"><div className="edu-company-avatar" aria-hidden="true">{story.name.split(" ").map(word => word[0]).join("")}</div><div className="testimonial-three__client-content"><h3 className="testimonial-three__client-name">{story.name}</h3><p className="testimonial-three__client-sub-title">{story.role} · {story.cohort}</p></div></div></article></div>)}</div></div></section>
    <CompanyCta title="Your story could be next." text="Join 48,000+ learners building real skills with EduPortal." actions={[{ label: "Start free", href: "/register" }, { label: "Browse courses", href: "/courses" }]} />
  </>;
}
