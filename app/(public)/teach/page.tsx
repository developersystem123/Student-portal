"use client";

import * as React from "react";
import Link from "next/link";
import Icon from "@/components/icons";
import { Badge, Button, Card, CardBody, Input, Label, Select, Textarea, useToast } from "@/components/ui";

const benefits = [
  {
    icon: <Icon.TrendingUp size={22} />,
    title: "Earn up to 70%",
    description: "Industry-leading revenue share. Keep more of what you make on every enrollment.",
  },
  {
    icon: <Icon.Users size={22} />,
    title: "Reach 48,000+ learners",
    description: "Tap into an engaged global audience actively looking for what you teach.",
  },
  {
    icon: <Icon.Sparkles size={22} />,
    title: "AI-assisted authoring",
    description: "Auto-generate quizzes, transcripts, and study guides. Spend more time teaching, less editing.",
  },
  {
    icon: <Icon.Award size={22} />,
    title: "Verifiable credentials",
    description: "Your students earn certificates that carry your name and link back to your profile.",
  },
  {
    icon: <Icon.PieChart size={22} />,
    title: "Real-time analytics",
    description: "See where learners thrive, where they drop off, and what to improve — for every chapter.",
  },
  {
    icon: <Icon.Heart size={22} />,
    title: "Dedicated success team",
    description: "Onboarding coach, launch reviews, and a private community of fellow instructors.",
  },
];

const steps = [
  {
    n: "01",
    title: "Apply",
    description: "Share your background, topic, and a short outline. Approvals usually take 3–5 days.",
  },
  {
    n: "02",
    title: "Build with us",
    description: "Use our authoring studio, recording guides, and editor support to ship a polished course.",
  },
  {
    n: "03",
    title: "Launch & grow",
    description: "We co-promote your launch, then keep the funnel flowing — newsletters, recommendations, and SEO.",
  },
];

const earningsTiers = [
  { label: "100 students/mo", price: "$9.99 course", earnings: "$700/mo" },
  { label: "500 students/mo", price: "$9.99 course", earnings: "$3,500/mo" },
  { label: "1,000 students/mo", price: "$19.99 course", earnings: "$14,000/mo" },
];

const faqs = [
  {
    q: "What kinds of courses can I create?",
    a: "Anything we don't already cover deeply: programming, design, business, data, languages, creative skills, soft skills. If you can teach it well, there's likely an audience for it.",
  },
  {
    q: "What equipment do I need?",
    a: "A decent USB mic, a quiet room, and your laptop. We provide a recording guide, lighting suggestions, and slide templates. Editing is included in our authoring studio.",
  },
  {
    q: "How long does a course take to build?",
    a: "Most instructors ship their first 3–5 hour course in 6–10 weeks. We pair you with an editor to keep things moving.",
  },
  {
    q: "When and how do I get paid?",
    a: "Monthly payouts on the 5th, via Stripe, PayPal, or wire — to 180+ countries. You can track earnings in real time from your instructor dashboard.",
  },
];

export default function TeachPage() {
  const toast = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    expertise: "Programming",
    experience: "1-3 years",
    pitch: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof form, string>>>({});

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.pitch.trim().length < 30) next.pitch = "Pitch should be at least 30 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", expertise: "Programming", experience: "1-3 years", pitch: "" });
      toast.push({
        title: "Application received",
        description: "We'll review it and get back within 3-5 business days.",
        tone: "success",
      });
    }, 800);
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="primary" className="mb-4">
              <Icon.Sparkles size={12} /> Now accepting Spring 2026 instructors
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Turn your expertise into a <span className="gradient-text">thriving course</span>.
            </h1>
            <p className="mt-5 text-lg text-[var(--muted)]">
              Whether you&apos;ve taught for years or want to share what you know for the first time, EduPortal gives
              you the tools, audience, and AI assist to do it well.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="#apply">
                <Button size="lg">
                  Apply to teach <Icon.ChevronRight size={18} />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  How it works
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <Icon.Check size={16} className="text-emerald-500" />
                <span>Free to apply</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon.Check size={16} className="text-emerald-500" />
                <span>No exclusivity</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-[var(--primary)]/20 via-transparent to-[var(--accent)]/20 blur-3xl rounded-3xl" />
            <Card className="relative overflow-hidden">
              <div className="aspect-[5/4] bg-gradient-to-br from-green-700 via-green-600 to-emerald-400 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,.3),transparent_60%)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8 text-center">
                  <Icon.Video size={36} className="opacity-90 mb-4" />
                  <p className="text-3xl font-bold">$2.4M+</p>
                  <p className="mt-1 text-sm opacity-85">paid to instructors last year</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs text-left">
                    <div className="rounded-xl bg-white/15 backdrop-blur p-3 border border-white/20">
                      <p className="text-xs opacity-80">Top earner</p>
                      <p className="text-lg font-bold">$184k</p>
                    </div>
                    <div className="rounded-xl bg-white/15 backdrop-blur p-3 border border-white/20">
                      <p className="text-xs opacity-80">Avg. rating</p>
                      <p className="text-lg font-bold">4.7 ★</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">What you get</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Built for instructors who care</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <Card key={b.title} className="h-full">
                <CardBody className="space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-400/15 text-[var(--primary)] flex items-center justify-center">
                    {b.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{b.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">How it works</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">From idea to launch in three steps</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <Card key={s.n} className="h-full">
              <CardBody className="space-y-3">
                <span className="inline-block text-3xl font-extrabold gradient-text">{s.n}</span>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{s.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[var(--surface)]/60 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Earnings potential</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">What you could make</h2>
            <p className="mt-3 text-[var(--muted)]">
              Estimates at our 70% revenue share. Actual earnings depend on pricing, traffic, and reviews.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {earningsTiers.map((t, i) => (
              <Card key={t.label} className={i === 1 ? "ring-2 ring-[var(--primary)]" : undefined}>
                <CardBody className="text-center space-y-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-2)] font-semibold">{t.label}</p>
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">{t.earnings}</p>
                  <p className="text-xs text-[var(--muted)]">at {t.price}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Apply</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Tell us what you&apos;d teach</h2>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            We review every application. Be specific — a clear pitch beats a long résumé. We&apos;ll get back within
            3–5 business days.
          </p>
          <div className="mt-6 space-y-3">
            {faqs.slice(0, 2).map((f) => (
              <Card key={f.q}>
                <CardBody>
                  <p className="font-semibold text-sm">{f.q}</p>
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">{f.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
        <Card className="lg:col-span-3">
          <CardBody className="p-6 lg:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="t-name">Your name</Label>
                  <Input
                    id="t-name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    error={errors.name}
                  />
                </div>
                <div>
                  <Label htmlFor="t-email">Email</Label>
                  <Input
                    id="t-email"
                    type="email"
                    icon={<Icon.Mail size={16} />}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    error={errors.email}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="t-exp">Area of expertise</Label>
                  <Select id="t-exp" value={form.expertise} onChange={(e) => update("expertise", e.target.value)}>
                    {["Programming", "Data Science", "Design", "Business", "Marketing", "Languages", "Other"].map(
                      (x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ),
                    )}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="t-years">Years of experience</Label>
                  <Select
                    id="t-years"
                    value={form.experience}
                    onChange={(e) => update("experience", e.target.value)}
                  >
                    {["< 1 year", "1-3 years", "3-7 years", "7+ years"].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="t-pitch">What would you teach, and for whom?</Label>
                <Textarea
                  id="t-pitch"
                  rows={6}
                  placeholder="e.g., A 6-hour intro to React for backend developers who already know JavaScript fundamentals…"
                  value={form.pitch}
                  onChange={(e) => update("pitch", e.target.value)}
                  error={errors.pitch}
                />
              </div>
              <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                <p className="text-xs text-[var(--muted)]">
                  By applying you agree to our{" "}
                  <Link href="/terms" className="text-[var(--primary)] hover:underline">
                    terms
                  </Link>
                  .
                </p>
                <Button type="submit" loading={submitting}>
                  <Icon.Send size={16} /> Submit application
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>

      <section className="bg-[var(--surface)]/60 border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Instructor FAQ</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <Card key={f.q}>
                <CardBody>
                  <p className="font-semibold">{f.q}</p>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{f.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
