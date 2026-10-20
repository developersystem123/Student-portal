"use client";

import * as React from "react";
import Link from "next/link";
import Icon from "@/components/icons";
import { Card, CardBody, Badge } from "@/components/ui";
import { BarChart, Donut, LineChart, ProgressBar, Sparkline } from "@/components/charts";
import { useAdmin, useAuth, useData } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import { HeroLink, IconChip, LivePulse, PageHero, QuickActions } from "@/components/layout/PageHero";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// How often the dashboard re-pulls data from the database.
const REFRESH_MS = 20_000;

// Index of a date within a rolling window that ends in the current month.
// Returns < 0 for dates before the window, >= months for future dates.
function monthIndex(t: number, months: number) {
  const now = new Date();
  const d = new Date(t);
  return months - 1 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

// New items per calendar month over the last `months` months.
function countByMonth(dates: string[], months = 6) {
  const now = new Date();
  const buckets: { day: string; hours: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ day: MONTH_LABELS[d.getMonth()], hours: 0 });
  }
  for (const iso of dates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) continue;
    const idx = monthIndex(t, months);
    if (idx >= 0 && idx < months) buckets[idx].hours += 1;
  }
  return buckets;
}

// Running cumulative total per month — the real grand total each month,
// counting everything created before the window as the starting baseline.
function cumulativeByMonth(dates: string[], months = 6): number[] {
  const perMonth = new Array(months).fill(0);
  let baseline = 0;
  for (const iso of dates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) continue;
    const idx = monthIndex(t, months);
    if (idx < 0) baseline += 1;
    else if (idx < months) perMonth[idx] += 1;
  }
  const series: number[] = [];
  let running = baseline;
  for (let i = 0; i < months; i++) {
    running += perMonth[i];
    series.push(running);
  }
  return series;
}

export default function AdminOverviewPage() {
  const admin = useAdmin();
  const { user } = useAuth();
  const { courses } = useData();

  const stats = admin.stats();
  const students = admin.listStudents();
  const teachers = admin.listTeachers();
  const enrollments = admin.listEnrollments();

  // ---------- Live auto-refresh ----------
  const [lastUpdated, setLastUpdated] = React.useState<Date>(() => new Date());
  const [refreshing, setRefreshing] = React.useState(false);

  const doRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await admin.refresh();
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [admin]);

  // Re-pull from the database on a fixed interval so the dashboard stays live.
  React.useEffect(() => {
    const id = setInterval(doRefresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [doRefresh]);

  // ---------- Derived data (all real, straight from the database) ----------
  const hasEnrollments = enrollments.length > 0;

  const recentStudents = [...students]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5);
  const recentEnrollments = enrollments.slice(0, 6);

  // Enrollment trend over the last 6 months.
  const trend = countByMonth(enrollments.map((e) => e.enrolledAt), 6);
  const trendTotal = trend.reduce((sum, b) => sum + b.hours, 0);

  // Enrollments by course category.
  const categoryCount = new Map<string, number>();
  for (const e of enrollments) {
    const course = courses.find((c) => c.id === e.courseId);
    if (!course) continue;
    categoryCount.set(course.category, (categoryCount.get(course.category) ?? 0) + 1);
  }
  const topCategories = Array.from(categoryCount.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Completion rate.
  const completedCount = enrollments.filter((e) => e.completed).length;
  const activeCount = enrollments.length - completedCount;
  const completionRate = hasEnrollments
    ? Math.round((completedCount / enrollments.length) * 100)
    : 0;

  // Top courses by enrollment.
  const courseCount = new Map<string, number>();
  for (const e of enrollments) {
    courseCount.set(e.courseId, (courseCount.get(e.courseId) ?? 0) + 1);
  }
  const topCourses = Array.from(courseCount.entries())
    .map(([id, count]) => ({ course: courses.find((c) => c.id === id), count }))
    .filter((x): x is { course: NonNullable<typeof x.course>; count: number } => !!x.course)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topCourseMax = topCourses[0]?.count ?? 1;

  // Cumulative growth series for the stat-card sparklines.
  const sparkStudents = cumulativeByMonth(
    students.map((s) => s.createdAt ?? "").filter(Boolean),
    6,
  );
  const sparkTeachers = cumulativeByMonth(
    teachers.map((t) => t.createdAt ?? "").filter(Boolean),
    6,
  );
  const sparkEnroll = cumulativeByMonth(enrollments.map((e) => e.enrolledAt), 6);
  const sparkCerts = cumulativeByMonth(
    enrollments.filter((e) => e.completed).map((e) => e.enrolledAt),
    6,
  );

  const cards: {
    label: string;
    value: number;
    icon: React.ReactNode;
    href: string;
    hint: string;
    series: number[];
    alert?: boolean;
  }[] = [
    {
      label: "Students",
      value: stats.students,
      icon: <Icon.User size={18} />,
      href: "/admin/students",
      hint: "Registered learners",
      series: sparkStudents,
    },
    {
      label: "Teachers",
      value: stats.teachers,
      icon: <Icon.Sparkles size={18} />,
      href: "/admin/teachers",
      hint: "Active instructors",
      series: sparkTeachers,
    },
    {
      label: "Courses",
      value: stats.courses,
      icon: <Icon.Book size={18} />,
      href: "/admin/courses",
      hint: "Published in the catalog",
      series: [] as number[],
    },
    {
      label: "Enrollments",
      value: stats.enrollments,
      icon: <Icon.ListChecks size={18} />,
      href: "/admin/enrollments",
      hint: "Across all students",
      series: sparkEnroll,
    },
    {
      label: "Certificates",
      value: stats.certificates,
      icon: <Icon.Award size={18} />,
      href: "/admin/enrollments",
      hint: "Awarded so far",
      series: sparkCerts,
    },
    {
      label: "Pending",
      value: stats.pendingApplications,
      icon: <Icon.Inbox size={18} />,
      href: "/admin/applications",
      hint: "Applications to review",
      series: [] as number[],
      alert: stats.pendingApplications > 0,
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      <PageHero
        art="admin"
        eyebrow="Admin console"
        eyebrowIcon={<Icon.Settings size={12} />}
        title="Welcome back,"
        highlight={user?.name?.split(" ")[0] ?? "Admin"}
        description="A live snapshot of your students, teachers, courses and recent activity. Use the shortcuts below to manage everything."
        actions={
          <>
            <HeroLink href="/admin/courses">
              <Icon.Book size={16} /> New course
            </HeroLink>
            <HeroLink href="/admin/students" variant="secondary">
              <Icon.Plus size={16} /> Add student
            </HeroLink>
          </>
        }
      >
        <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--hero-border)] bg-[var(--surface)] pl-3.5 pr-1.5 py-1.5 text-xs text-[var(--muted)]">
          <LivePulse />
          <span>
            Auto-refreshes every {REFRESH_MS / 1000}s · Updated{" "}
            <span className="font-semibold text-[var(--heading)]">{relativeTime(lastUpdated)}</span>
          </span>
          <button
            type="button"
            onClick={doRefresh}
            disabled={refreshing}
            className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] text-[var(--heading)] text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {refreshing ? <Icon.Loader size={14} /> : <RefreshIcon size={14} />}
            {refreshing ? "Updating…" : "Refresh"}
          </button>
        </div>
      </PageHero>

      <QuickActions
        actions={[
          { href: "/admin/students", label: "Add student", icon: <Icon.User size={18} /> },
          { href: "/admin/teachers", label: "Add teacher", icon: <Icon.Sparkles size={18} />, tone: "info" },
          { href: "/admin/courses", label: "New course", icon: <Icon.Book size={18} /> },
          { href: "/admin/live-classes", label: "Live class", icon: <Icon.Video size={18} />, tone: "info" },
          {
            href: "/admin/applications",
            label: "Applications",
            icon: <Icon.Inbox size={18} />,
            tone: "amber",
            badge: stats.pendingApplications,
          },
          { href: "/admin/reports", label: "Reports", icon: <Icon.BarChart3 size={18} />, tone: "neutral" },
        ]}
      />

      {/* Stat cards with live sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="block group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))]">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <IconChip tone={c.alert ? "amber" : "primary"}>{c.icon}</IconChip>
                  <Icon.ChevronRight
                    size={16}
                    className="text-[var(--muted-2)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition"
                  />
                </div>
                <p className="text-3xl font-bold tracking-tight text-[var(--heading)] tabular-nums">{c.value}</p>
                <p className="text-xs font-medium text-[var(--foreground)]">{c.label}</p>
                <div className="flex items-end justify-between gap-2 pt-1">
                  <p className="text-[11px] text-[var(--muted-2)]">{c.hint}</p>
                  {c.series.length >= 2 && (
                    <Sparkline data={c.series} width={64} height={26} />
                  )}
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts row 1: enrollment trend + completion rate */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  Enrollment trend
                  <LivePulse />
                </h2>
                <p className="text-xs text-[var(--muted)]">New enrollments over the last 6 months</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-semibold">
                <Icon.TrendingUp size={12} /> {trendTotal} in 6 mo
              </span>
            </div>
            {hasEnrollments ? (
              <div className="h-[220px] mt-3">
                <LineChart data={trend} yFormatter={(v) => Math.round(v).toString()} />
              </div>
            ) : (
              <ChartEmpty label="No enrollments yet — the trend appears here as students join courses." />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">Completion rate</h2>
              <Badge variant="info">{completionRate}%</Badge>
            </div>
            <p className="text-xs text-[var(--muted)]">Across all enrollments</p>
            {hasEnrollments ? (
              <>
                <div className="flex items-center justify-center py-4">
                  <Donut value={completionRate} size={160} label="completed" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold">Active</p>
                    <p className="text-sm font-bold mt-0.5">{activeCount}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold">Done</p>
                    <p className="text-sm font-bold mt-0.5">{completedCount}</p>
                  </div>
                </div>
              </>
            ) : (
              <ChartEmpty label="No enrollments to measure yet." />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2: category bars + top courses */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-semibold">Top categories</h2>
                <p className="text-xs text-[var(--muted)]">Enrollments by course category</p>
              </div>
              <Icon.PieChart size={16} className="text-[var(--muted-2)]" />
            </div>
            {topCategories.length === 0 ? (
              <ChartEmpty label="No enrollments yet." />
            ) : (
              <div className="h-[240px] mt-3">
                <BarChart data={topCategories} height={240} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">Top courses</h2>
                <p className="text-xs text-[var(--muted)]">Most-enrolled courses on the platform</p>
              </div>
              <Link href="/admin/courses" className="text-xs text-[var(--primary)] hover:underline font-medium">
                Manage
              </Link>
            </div>
            {topCourses.length === 0 ? (
              <ChartEmpty label="No enrollments yet." />
            ) : (
              <ul className="space-y-3">
                {topCourses.map(({ course, count }) => (
                  <li key={course.id}>
                    <ProgressBar
                      label={course.title}
                      value={(count / topCourseMax) * 100}
                      hint={`${count} ${count === 1 ? "learner" : "learners"}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent students</h2>
              <Link href="/admin/students" className="text-xs text-[var(--primary)] hover:underline font-medium">
                View all
              </Link>
            </div>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 text-center">No students yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentStudents.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold inline-flex items-center justify-center text-sm">
                      {s.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{s.email}</p>
                    </div>
                    <Badge variant="default">
                      {s.enrolledCount} {s.enrolledCount === 1 ? "course" : "courses"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent enrollments</h2>
              <Link href="/admin/enrollments" className="text-xs text-[var(--primary)] hover:underline font-medium">
                View all
              </Link>
            </div>
            {recentEnrollments.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 text-center">No enrollments yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentEnrollments.map((e) => (
                  <li key={`${e.userId}-${e.courseId}`} className="flex items-start gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                      <Icon.Book size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.courseTitle}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {e.userName} · {relativeTime(e.enrolledAt)}
                      </p>
                    </div>
                    {e.completed ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="info">{e.progress}%</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Course catalog</h2>
            <Link href="/admin/courses" className="text-xs text-[var(--primary)] hover:underline font-medium">
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {courses.slice(0, 6).map((c) => (
              <Link key={c.id} href="/admin/courses" className="group">
                <div className="aspect-video rounded-xl overflow-hidden border border-[var(--border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <p className="mt-2 text-xs font-medium truncate">{c.title}</p>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-12">
      <div className="h-10 w-10 rounded-full bg-[var(--surface-2)] text-[var(--muted-2)] flex items-center justify-center">
        <Icon.BarChart3 size={18} />
      </div>
      <p className="text-sm text-[var(--muted)] max-w-[14rem]">{label}</p>
    </div>
  );
}

function RefreshIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
