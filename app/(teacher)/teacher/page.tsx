"use client";

import Link from "next/link";
import Icon from "@/components/icons";
import { Badge, Card, CardBody } from "@/components/ui";
import { BarChart, Donut, LineChart, ProgressBar, Sparkline } from "@/components/charts";
import { useAuth, useTeacher } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import {
  HeroFact,
  HeroLink,
  IconChip,
  LivePulse,
  PageHero,
  QuickActions,
  type QuickAction,
} from "@/components/layout/PageHero";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthBuckets(dates: string[], months = 6) {
  const now = new Date();
  const buckets: { day: string; hours: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ day: MONTH_LABELS[d.getMonth()], hours: 0 });
  }
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime();
  for (const iso of dates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t) || t < start) continue;
    const d = new Date(t);
    const idx = months - 1 - ((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
    if (idx >= 0 && idx < months) buckets[idx].hours += 1;
  }
  return buckets;
}

export default function TeacherOverviewPage() {
  const { user } = useAuth();
  const teacher = useTeacher();
  const myCourses = teacher.myCourses();
  const myStudents = teacher.myStudents();
  const stats = teacher.stats();

  const recentStudents = myStudents.slice(0, 6);
  const isDemo = myStudents.length === 0;

  // Enrollment trend across teacher's courses (last 6 months)
  const realTrend = monthBuckets(myStudents.map((s) => s.enrolledAt), 6);
  const demoTrend = realTrend.map((b, i) => ({ ...b, hours: [3, 5, 4, 7, 11, 14][i] ?? 0 }));
  const trendBuckets = isDemo ? demoTrend : realTrend;

  // Per-course enrollment counts
  const perCourseReal = myCourses
    .map((c) => {
      const list = myStudents.filter((s) => s.courseId === c.id);
      return {
        course: c,
        total: list.length,
        completed: list.filter((s) => s.completed).length,
        avgProgress: list.length
          ? Math.round(list.reduce((acc, s) => acc + s.progress, 0) / list.length)
          : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const demoTotals = [18, 14, 10, 7, 5, 3];
  const demoAvg = [78, 64, 55, 47, 38, 30];
  const perCourse = isDemo
    ? myCourses.slice(0, 6).map((course, i) => ({
        course,
        total: demoTotals[i] ?? 2,
        completed: Math.round(((demoTotals[i] ?? 2) * (demoAvg[i] ?? 30)) / 100),
        avgProgress: demoAvg[i] ?? 30,
      }))
    : perCourseReal;

  const courseBarData = perCourse.slice(0, 6).map((p) => ({
    label: p.course.title.length > 14 ? p.course.title.slice(0, 12) + "…" : p.course.title,
    value: p.total,
  }));

  // Completion rate
  const completionRate = isDemo
    ? 58
    : myStudents.length
      ? Math.round((myStudents.filter((s) => s.completed).length / myStudents.length) * 100)
      : 0;
  const activeCount = isDemo ? 23 : myStudents.filter((s) => !s.completed).length;
  const doneCount = isDemo ? 32 : myStudents.filter((s) => s.completed).length;

  // Progress distribution buckets
  let buckets = [
    { label: "0–24%", value: 0 },
    { label: "25–49%", value: 0 },
    { label: "50–74%", value: 0 },
    { label: "75–99%", value: 0 },
    { label: "100%", value: 0 },
  ];
  for (const s of myStudents) {
    if (s.progress >= 100) buckets[4].value += 1;
    else if (s.progress >= 75) buckets[3].value += 1;
    else if (s.progress >= 50) buckets[2].value += 1;
    else if (s.progress >= 25) buckets[1].value += 1;
    else buckets[0].value += 1;
  }
  if (isDemo) {
    buckets = [
      { label: "0–24%", value: 8 },
      { label: "25–49%", value: 12 },
      { label: "50–74%", value: 16 },
      { label: "75–99%", value: 11 },
      { label: "100%", value: 13 },
    ];
  }

  // Sparkline series for stat cards
  const realSparkCourses = monthBuckets(myCourses.map(() => new Date().toISOString()), 6).map(
    (b) => b.hours,
  );
  const realSparkStudents = trendBuckets.map((b) => b.hours);
  const realSparkCompletions = monthBuckets(
    myStudents.filter((s) => s.completed).map((s) => s.enrolledAt),
    6,
  ).map((b) => b.hours);

  const sparkCourses = isDemo ? [1, 2, 2, 3, 3, 4] : realSparkCourses;
  const sparkStudents = isDemo ? [3, 5, 4, 7, 11, 14] : realSparkStudents;
  const sparkCompletions = isDemo ? [0, 1, 2, 4, 6, 9] : realSparkCompletions;

  const cards = [
    {
      label: "Courses you teach",
      value: stats.courses,
      icon: <Icon.Book size={18} />,
      href: "/teacher/courses",
      hint: "Across all categories",
      series: sparkCourses,
    },
    {
      label: "Enrolled students",
      value: isDemo ? 55 : stats.students,
      icon: <Icon.Users size={18} />,
      href: "/teacher/students",
      hint: "Unique learners in your classes",
      series: sparkStudents,
    },
    {
      label: "Completions",
      value: isDemo ? 32 : stats.completions,
      icon: <Icon.Award size={18} />,
      href: "/teacher/students",
      hint: "Students who finished a course",
      series: sparkCompletions,
    },
  ];

  const quickActions: QuickAction[] = [
    { icon: <Icon.FilePen size={18} />, label: "New assignment", href: "/teacher/assignments" },
    { icon: <Icon.Calendar size={18} />, label: "Add schedule event", href: "/teacher/schedule", tone: "amber" },
    { icon: <Icon.ListChecks size={18} />, label: "Gradebook", href: "/teacher/grades", tone: "info" },
    { icon: <Icon.BarChart3 size={18} />, label: "Analytics", href: "/teacher/analytics" },
    { icon: <Icon.Video size={18} />, label: "Live classes", href: "/teacher/live", tone: "amber" },
    { icon: <Icon.Megaphone size={18} />, label: "Announce", href: "/teacher/announcements", tone: "info" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <PageHero
        art="teacher"
        eyebrow="Teacher studio"
        eyebrowIcon={<Icon.Sparkles size={12} />}
        title="Welcome back,"
        highlight={user?.name?.split(" ")[0] ?? "Teacher"}
        description="A quick look at your courses and the students learning from you. Jump in below to manage content or track progress."
        actions={
          <>
            <HeroLink href="/teacher/courses">
              <Icon.Book size={16} /> My courses
            </HeroLink>
            <HeroLink href="/teacher/students" variant="secondary">
              <Icon.Users size={16} /> View students
            </HeroLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <HeroFact value={stats.courses} label="Courses taught" />
          <HeroFact value={isDemo ? 55 : stats.students} label="Students" />
          <HeroFact value={`${completionRate}%`} label="Completion rate" />
        </div>
      </PageHero>

      <QuickActions actions={quickActions} />

      {/* Stat cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="block group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))]">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <IconChip>{c.icon}</IconChip>
                  <Icon.ChevronRight size={16} className="text-[var(--muted-2)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-[var(--heading)] tabular-nums">{c.value}</p>
                <p className="text-xs font-medium text-[var(--foreground)]">{c.label}</p>
                <div className="flex items-end justify-between gap-2 pt-1">
                  <p className="text-[11px] text-[var(--muted-2)]">{c.hint}</p>
                  <Sparkline data={c.series.length >= 2 ? c.series : [0, 0, 0, 0, 0, 0]} width={80} height={28} />
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts row 1: enrollment trend + completion donut */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  Student enrollments
                  <LivePulse />
                </h2>
                <p className="text-xs text-[var(--muted)]">New sign-ups across your courses, last 6 months</p>
              </div>
              <div className="flex items-center gap-2">
                {isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                    Sample
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-semibold">
                  <Icon.TrendingUp size={12} /> Last 6 mo
                </span>
              </div>
            </div>
            <div className="h-[220px] mt-3">
              <LineChart data={trendBuckets} yFormatter={(v) => Math.round(v).toString()} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">Completion rate</h2>
              <Badge variant="info">{completionRate}%</Badge>
            </div>
            <p className="text-xs text-[var(--muted)]">Across your students</p>
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
                <p className="text-sm font-bold mt-0.5">{doneCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2: per-course bars + progress distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-semibold">Enrollments per course</h2>
                <p className="text-xs text-[var(--muted)]">Where your students are right now</p>
              </div>
              <Icon.BarChart3 size={16} className="text-[var(--muted-2)]" />
            </div>
            {courseBarData.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-10 text-center">No enrollments yet.</p>
            ) : (
              <div className="h-[240px] mt-3">
                <BarChart data={courseBarData} height={240} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-semibold">Progress distribution</h2>
                <p className="text-xs text-[var(--muted)]">How far along your students are</p>
              </div>
              <Icon.PieChart size={16} className="text-[var(--muted-2)]" />
            </div>
            {myStudents.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-10 text-center">No enrollments yet.</p>
            ) : (
              <div className="h-[240px] mt-3">
                <BarChart data={buckets} height={240} />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Course performance list */}
      {perCourse.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">Course performance</h2>
                <p className="text-xs text-[var(--muted)]">Average completion progress per course</p>
              </div>
              <Link href="/teacher/courses" className="text-xs text-[var(--primary)] hover:underline font-medium">
                Manage
              </Link>
            </div>
            <ul className="space-y-3">
              {perCourse.slice(0, 5).map((p) => (
                <li key={p.course.id}>
                  <ProgressBar
                    label={p.course.title}
                    value={p.avgProgress}
                    hint={`${p.avgProgress}% avg · ${p.total} ${p.total === 1 ? "learner" : "learners"}`}
                  />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Your courses</h2>
              <Link href="/teacher/courses" className="text-xs text-[var(--primary)] hover:underline font-medium">
                Manage
              </Link>
            </div>
            {myCourses.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 text-center">
                You aren&apos;t assigned to any courses yet. Ask an admin to assign you as the instructor on a course.
              </p>
            ) : (
              <ul className="space-y-3">
                {myCourses.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <div className="h-10 w-14 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {c.category} · {c.chapters.length} chapters
                      </p>
                    </div>
                    <Badge variant="default">{c.level}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent activity</h2>
              <Link href="/teacher/students" className="text-xs text-[var(--primary)] hover:underline font-medium">
                View all
              </Link>
            </div>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6 text-center">No students have enrolled yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentStudents.map((s) => (
                  <li key={`${s.userId}-${s.courseId}`} className="flex items-start gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold inline-flex items-center justify-center text-sm">
                      {s.userName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.userName}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {s.courseTitle} · {relativeTime(s.enrolledAt)}
                      </p>
                    </div>
                    {s.completed ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="info">{s.progress}%</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
