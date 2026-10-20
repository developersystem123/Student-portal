/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn } from "@/lib/utils";

const ART = "/site/assets/images/edu/";

/** Website illustrations a portal hero can use. */
export const HERO_ART = {
  student: { src: `${ART}edu-art-page-header.png`, width: 862, height: 648 },
  teacher: { src: `${ART}edu-art-teach-studio.png`, width: 828, height: 1062 },
  admin: { src: `${ART}edu-art-story-growth.png`, width: 959, height: 675 },
} as const;

/**
 * Welcome band for a portal home page, built like the website's page header: the soft green band,
 * the brand ring, book and cap shapes, a squiggle under the highlighted word and an illustration
 * from the site on the right.
 */
export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  actions,
  art,
  children,
}: {
  eyebrow: string;
  eyebrowIcon?: React.ReactNode;
  /** Plain part of the heading; `highlight` follows it in green with the squiggle underneath. */
  title: string;
  highlight?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  art: keyof typeof HERO_ART;
  /** Optional row under the actions (quick facts, chips). */
  children?: React.ReactNode;
}) {
  const img = HERO_ART[art];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--hero-border)] bg-[var(--hero-bg)]">
      <img
        src={`${ART}page-header-ring.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -right-24 -top-28 w-[380px] opacity-90 dark:opacity-[0.07]"
      />
      <img
        src={`${ART}page-header-book.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none select-none hidden xl:block absolute left-[50%] top-6 w-14 float-slow"
      />
      <img
        src={`${ART}page-header-cap.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none select-none hidden xl:block absolute left-[56%] bottom-10 w-16 opacity-80 dark:opacity-50 -rotate-12"
      />

      <div className="relative grid md:grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:py-12 max-w-2xl">
          <p className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[var(--surface)] border border-[var(--hero-border)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
            {eyebrowIcon}
            {eyebrow}
          </p>
          <h1 className="mt-4 text-[30px] sm:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-[var(--heading)]">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="relative inline-block text-[var(--primary)]">
                  {highlight}
                  <img
                    src={`${ART}page-header-squiggle.svg`}
                    alt=""
                    aria-hidden
                    className="absolute left-0 -bottom-2 w-full h-[7px] dark:brightness-150"
                  />
                </span>
              </>
            )}
          </h1>
          {description && (
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)] max-w-xl">{description}</p>
          )}
          {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}
          {children && <div className="mt-6">{children}</div>}
        </div>
        <div className="hidden md:flex self-end justify-end pr-6 lg:pr-10">
          <img
            src={img.src}
            alt=""
            aria-hidden
            width={img.width}
            height={img.height}
            className={cn(
              "w-auto object-contain object-bottom select-none",
              art === "teacher" ? "h-[230px] lg:h-[280px] mt-4" : "h-[190px] lg:h-[240px] mb-6",
            )}
          />
        </div>
      </div>
    </section>
  );
}

/** Link styled as the website's buttons, for hero actions. */
export function HeroLink({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center gap-2 px-5 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hero-bg)]",
        variant === "primary"
          ? "btn-primary"
          : "bg-[var(--surface)] text-[var(--heading)] border border-[var(--border-strong)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
      )}
    >
      {children}
    </Link>
  );
}

const CHIP_TONES = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  amber: "bg-[var(--amber-soft)] text-[var(--amber)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  neutral: "bg-[var(--surface-2)] text-[var(--heading)]",
} as const;

export type ChipTone = keyof typeof CHIP_TONES;

/** Tinted square that holds an icon, limited to the brand's tones. */
export function IconChip({
  tone = "primary",
  size = "md",
  className,
  children,
}: {
  tone?: ChipTone;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl",
        CHIP_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type QuickAction = {
  icon: React.ReactNode;
  label: string;
  href: string;
  tone?: ChipTone;
  /** Count shown as a pill (e.g. items waiting for review); hidden when 0. */
  badge?: number;
};

/** Row of shortcut tiles under a hero. */
export function QuickActions({ actions, title = "Quick actions" }: { actions: QuickAction[]; title?: string }) {
  return (
    <section aria-label={title}>
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)] font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] hover:shadow-[var(--shadow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition"
          >
            <IconChip tone={a.tone}>{a.icon}</IconChip>
            <span className="flex-1 min-w-0 text-[13px] font-semibold leading-snug text-[var(--heading)] group-hover:text-[var(--primary)] transition-colors">
              {a.label}
            </span>
            {!!a.badge && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--amber-soft)] text-[var(--amber)] text-[11px] font-bold tabular-nums inline-flex items-center justify-center">
                {a.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Small pulsing "Live" marker for real-time panels. */
export function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60 animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
      </span>
      Live
    </span>
  );
}

/** Small fact shown in a hero: a value with a label underneath. */
export function HeroFact({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xl font-bold tracking-tight text-[var(--heading)] tabular-nums">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
