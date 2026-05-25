import Link from "next/link";
import Icon from "@/components/icons";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/pricing", label: "Pricing" },
      { href: "/business", label: "For Business" },
      { href: "/teach", label: "Become a Teacher" },
      { href: "/affiliate", label: "Affiliate program" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press & Media" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
      { href: "/verify", label: "Verify a certificate" },
      { href: "/status", label: "Service status" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
      { href: "/refund", label: "Refunds" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/xtroedge-x.svg"
              alt="XtroEdge"
              width={44}
              height={44}
              className="rounded-xl shadow-sm group-hover:shadow-md group-hover:shadow-green-500/20 transition shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold gradient-text">EduPortal</span>
              <span className="text-[10px] text-[var(--muted-2)] -mt-0.5 tracking-wider">LEARN · BUILD · GROW</span>
            </div>
          </Link>
          <p className="mt-4 text-sm text-[var(--muted)] max-w-sm">
            An AI-powered learning platform that helps students master new skills with personalized courses, quizzes, and
            real-time help.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="mailto:hello@eduportal.app"
              className="h-9 w-9 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] inline-flex items-center justify-center transition"
              aria-label="Email"
            >
              <Icon.Mail size={16} />
            </a>
            <a
              href="#"
              className="h-9 w-9 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] inline-flex items-center justify-center transition"
              aria-label="Twitter"
            >
              <Icon.Send size={16} />
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs uppercase tracking-wider text-[var(--muted-2)] font-semibold mb-3">{c.title}</p>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} EduPortal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="gradient-text font-semibold">love</span> for learners.
          </p>
        </div>
      </div>
    </footer>
  );
}

