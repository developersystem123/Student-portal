import Link from "next/link";
import Icon from "@/components/icons";
import { Badge, Button, Card, CardBody } from "@/components/ui";

export const metadata = {
  title: "Press & Media — EduPortal",
  description:
    "Press releases, media kit, brand assets, and contact info for journalists, podcasters, and partners covering EduPortal.",
};

const releases = [
  {
    date: "2026-04-22",
    title: "EduPortal closes $42M Series B to bring AI-powered tutoring to 10M students",
    excerpt:
      "The round is led by Pinepoint Ventures with participation from Lumina Capital and existing investors. Funds will accelerate curriculum, AI safety research, and expansion into Latin America and Southeast Asia.",
  },
  {
    date: "2026-03-08",
    title: "EduPortal launches Verified Career Tracks, a job-aligned learning path",
    excerpt:
      "Career Tracks pair our courses with industry mentors and a portfolio capstone, designed so graduates can apply to entry-level roles immediately. Launch partners include Stripe, Atlassian, and Figma.",
  },
  {
    date: "2026-01-17",
    title: "EduPortal partners with the IIT system to bring AI study tools to 28,000 students",
    excerpt:
      "Students at all 23 IITs will get free Pro access for the 2026 academic year. The partnership also opens a research collaboration on AI-supported learning outcomes.",
  },
  {
    date: "2025-11-04",
    title: "EduPortal hits 1 million active monthly learners",
    excerpt:
      "Just 30 months after launch, EduPortal crosses the 1M monthly active learner mark. Top growth markets include India, Brazil, Nigeria, and Indonesia.",
  },
  {
    date: "2025-08-19",
    title: "New AI Quiz Generator turns any topic into a personalized practice set",
    excerpt:
      "Our most-requested feature: convert any topic, link, or PDF into an interactive quiz tailored to your level. Available to all Pro members today.",
  },
];

const mentions = [
  { outlet: "TechCrunch", headline: "EduPortal is rewriting how the world studies", date: "2026-04-23" },
  { outlet: "The Verge", headline: "Inside EduPortal's bet that AI tutors really can teach", date: "2026-03-12" },
  { outlet: "WIRED", headline: "When the textbook can talk back: AI in classrooms", date: "2026-02-04" },
  { outlet: "Forbes", headline: "The 30 EdTech companies to watch in 2026", date: "2026-01-29" },
  { outlet: "Bloomberg", headline: "EdTech's quiet comeback, led by AI-first platforms", date: "2025-12-11" },
];

const facts = [
  { label: "Founded", value: "2023" },
  { label: "Headquarters", value: "Bengaluru, India" },
  { label: "Team size", value: "84 across 17 countries" },
  { label: "Monthly learners", value: "1.2M+" },
  { label: "Courses", value: "320+ across 18 categories" },
  { label: "Funding to date", value: "$57M" },
];

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PressPage() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 lg:pt-20 lg:pb-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Press & Media</p>
          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Resources for <span className="gradient-text">journalists</span> & partners.
          </h1>
          <p className="mt-5 text-lg text-[var(--muted)]">
            Reporting on EduPortal? Working on a story about AI and education? Here&apos;s everything you need —
            announcements, facts, and approved brand assets.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="mailto:press@eduportal.app">
              <Button>
                <Icon.Mail size={16} /> press@eduportal.app
              </Button>
            </a>
            <Link href="#assets">
              <Button variant="outline">
                <Icon.Download size={16} /> Brand assets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Company fact sheet</p>
              <h2 className="mt-2 text-2xl font-bold">Quick facts</h2>
            </div>
            <a
              href="mailto:press@eduportal.app?subject=Fact sheet (PDF) request"
              className="text-sm text-[var(--primary)] hover:underline font-medium inline-flex items-center gap-1"
            >
              <Icon.Download size={14} /> Download PDF
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {facts.map((f) => (
              <Card key={f.label}>
                <CardBody>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-2)] font-semibold">{f.label}</p>
                  <p className="mt-1 text-xl font-bold">{f.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Announcements</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Latest from EduPortal</h2>
        </div>
        <ul className="space-y-4">
          {releases.map((r) => (
            <li key={r.title}>
              <Card className="hover:border-[var(--primary)]/30 transition">
                <CardBody className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">Press release</Badge>
                    <span className="text-xs text-[var(--muted)]">{formatDate(r.date)}</span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug">{r.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{r.excerpt}</p>
                  <a
                    href="mailto:press@eduportal.app?subject=Full release request"
                    className="text-sm text-[var(--primary)] hover:underline font-medium inline-flex items-center gap-1 pt-1"
                  >
                    Request full release <Icon.ChevronRight size={14} />
                  </a>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[var(--surface)]/60 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">In the news</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Recent coverage</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {mentions.map((m) => (
              <li key={m.outlet + m.date}>
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold gradient-text">{m.outlet}</p>
                      <span className="text-xs text-[var(--muted)]">{formatDate(m.date)}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug">&ldquo;{m.headline}&rdquo;</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="assets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Brand assets</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Logos, colors, and screenshots</h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              Use our wordmark and logo at full color or single-color. Don&apos;t recolor, distort, or place on
              low-contrast backgrounds. Please keep our name as a single word: <strong>EduPortal</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="mailto:press@eduportal.app?subject=Brand kit request">
                <Button>
                  <Icon.Download size={16} /> Download brand kit (ZIP)
                </Button>
              </a>
              <a href="mailto:press@eduportal.app?subject=Screenshot pack request">
                <Button variant="outline">
                  <Icon.Camera size={16} /> Product screenshots
                </Button>
              </a>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-green-700 via-green-600 to-emerald-400 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,.3),transparent_60%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="h-20 w-20 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
                  <Icon.Logo size={40} />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">EduPortal</p>
                <p className="text-xs opacity-80 tracking-wider uppercase">Learn · Build · Grow</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 lg:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Working on a story?</h2>
          <p className="mt-3 text-[var(--muted)] max-w-xl mx-auto">
            We respond to most press inquiries within 24 hours. For interviews with our founders or product team, please
            include your outlet, deadline, and topic.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:press@eduportal.app">
              <Button size="lg">
                <Icon.Mail size={18} /> press@eduportal.app
              </Button>
            </a>
            <Link href="/contact?reason=Press">
              <Button size="lg" variant="outline">
                Use contact form
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
