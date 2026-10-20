"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardHeader, CardTitle, Progress, StatCard } from "@/components/ui";
import { HeroFact, HeroLink, PageHero } from "@/components/layout/PageHero";
import Icon from "@/components/icons";
import { BarChart, Donut, Heatmap, LineChart, ProgressBar, RadialBars, Sparkline } from "@/components/charts";
import { useAuth, useData } from "@/lib/store";
import {
  ACTIVITY_HEATMAP,
  COURSES,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_DEADLINES,
  HOURS_BY_CATEGORY,
  LEADERBOARD,
  QUIZ_SCORE_HISTORY,
  RECENT_BADGES,
  RECOMMENDED_NEXT,
  SKILL_MASTERY,
  STUDY_STREAK,
  STUDY_TIME_OF_DAY,
  UPCOMING_LIVE_SESSIONS,
  WEEKLY_GOAL,
  WEEKLY_HOURS,
  XP_DATA,
} from "@/lib/mockData";
import { formatHours } from "@/lib/utils";

const BADGE_ICONS = {
  flame: <Icon.TrendingUp size={20} />,
  star: <Icon.Star size={20} />,
  award: <Icon.Award size={20} />,
  moon: <Icon.Moon size={20} />,
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const { enrollments, certificates } = useData();

  const inProgress = enrollments.filter((e) => !e.completed);
  const totalMinutes = enrollments.reduce((sum, e) => {
    const c = COURSES.find((x) => x.id === e.courseId);
    if (!c) return sum;
    return sum + Math.round((c.durationMinutes * e.progress) / 100);
  }, 0);
  const avgScore =
    certificates.length === 0
      ? 0
      : Math.round(certificates.reduce((s, c) => s + c.score, 0) / certificates.length);

  // Quiz line chart needs the LineChart shape ({day, hours}).
  const quizLineData = QUIZ_SCORE_HISTORY.map((q, i) => ({ day: `Q${i + 1}`, hours: q.score }));
  const heatmapWeeks = 12;
  const xpPct = Math.min(100, (XP_DATA.xp / XP_DATA.xpForNext) * 100);
  const goalPct = Math.min(100, (WEEKLY_GOAL.doneHours / WEEKLY_GOAL.goalHours) * 100);

  return (
    <div className="space-y-6">
      <PageHero
        art="student"
        eyebrow="Student dashboard"
        eyebrowIcon={<Icon.Sparkles size={12} />}
        title="Welcome back,"
        highlight={user?.name?.split(" ")[0] ?? "learner"}
        description={
          <>
            You&apos;re on a {STUDY_STREAK.current}-day streak — your best yet is {STUDY_STREAK.longest}. Pick
            up where you left off or find something new to learn.
          </>
        }
        actions={
          <>
            <HeroLink href="/my-courses">
              <Icon.PlayCircle size={16} /> Continue learning
            </HeroLink>
            <HeroLink href="/explore" variant="secondary">
              <Icon.Compass size={16} /> Browse courses
            </HeroLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <HeroFact value={`${STUDY_STREAK.current} days`} label="Current streak" />
          <HeroFact value={`${WEEKLY_GOAL.doneHours.toFixed(1)}h / ${WEEKLY_GOAL.goalHours}h`} label="Weekly goal" />
          <HeroFact value={`Level ${XP_DATA.level}`} label={XP_DATA.rank} />
        </div>
      </PageHero>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Courses"
          value={enrollments.length}
          delta="+1 this month"
          tone="primary"
          icon={<Icon.Book size={22} />}
        />
        <StatCard
          label="Hours Learned"
          value={formatHours(totalMinutes)}
          delta="+3h this week"
          tone="accent"
          icon={<Icon.Clock size={22} />}
        />
        <StatCard
          label="Certificates"
          value={certificates.length}
          tone="warning"
          icon={<Icon.Award size={22} />}
        />
        <StatCard
          label="Avg. Score"
          value={`${avgScore}%`}
          delta={avgScore > 0 ? "Great work!" : "Take a quiz!"}
          tone="success"
          icon={<Icon.TrendingUp size={22} />}
        />
      </div>

      {/* Activity heatmap + Streak/XP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Study activity</CardTitle>
              <p className="text-xs text-[var(--muted)] mt-1">
                Last {heatmapWeeks} weeks · {STUDY_STREAK.daysActiveThisYear} active days this year
              </p>
            </div>
            <Badge variant="success">
              <Icon.TrendingUp size={12} /> Streak {STUDY_STREAK.current}d
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col md:flex-row md:items-stretch gap-6">
              <div className="md:flex-1 min-w-0">
                <div className="overflow-x-auto scrollbar-thin">
                  <div className="min-w-[300px] h-44">
                    <Heatmap cells={ACTIVITY_HEATMAP} weeks={heatmapWeeks} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--muted-2)]" aria-hidden>
                  Less
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--surface-3)]" />
                  {[0.3, 0.55, 0.8, 1].map((o) => (
                    <span key={o} className="h-2.5 w-2.5 rounded-[3px] bg-[var(--primary)]" style={{ opacity: o }} />
                  ))}
                  More
                </div>
              </div>
              <dl className="grid grid-cols-3 md:grid-cols-1 gap-4 md:w-44 md:pl-6 md:border-l border-[var(--border)] content-center">
                <div>
                  <dt className="text-xs text-[var(--muted)]">This week</dt>
                  <dd className="mt-0.5 text-lg font-bold tracking-tight text-[var(--heading)] tabular-nums">
                    {STUDY_STREAK.thisWeekSessions} sessions
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">Longest streak</dt>
                  <dd className="mt-0.5 text-lg font-bold tracking-tight text-[var(--heading)] tabular-nums">
                    {STUDY_STREAK.longest} days
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">Active this year</dt>
                  <dd className="mt-0.5 text-lg font-bold tracking-tight text-[var(--heading)] tabular-nums">
                    {STUDY_STREAK.daysActiveThisYear} days
                  </dd>
                </div>
              </dl>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Level &amp; goals</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-3">
              <Donut value={xpPct} size={84} label={`Lv ${XP_DATA.level}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{XP_DATA.rank}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {XP_DATA.xp.toLocaleString()} / {XP_DATA.xpForNext.toLocaleString()} XP
                </p>
                <p className="text-xs font-medium text-[var(--primary)] mt-0.5">+{XP_DATA.weeklyXp} XP this week</p>
              </div>
            </div>
            <div>
              <ProgressBar
                value={goalPct}
                label={`Weekly goal — ${WEEKLY_GOAL.doneHours.toFixed(1)}h of ${WEEKLY_GOAL.goalHours}h`}
                hint={`${Math.round(goalPct)}%`}
              />
              <p className="text-xs text-[var(--muted-2)] mt-2">
                {STUDY_STREAK.thisWeekSessions} of {STUDY_STREAK.weeklyGoalSessions} sessions logged this week
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Weekly hours + Skill mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly learning hours</CardTitle>
              <p className="text-xs text-[var(--muted)] mt-1">Past 7 days</p>
            </div>
            <Badge variant="primary">
              <Icon.TrendingUp size={12} /> +18%
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <LineChart data={WEEKLY_HOURS} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill mastery</CardTitle>
            <p className="text-xs text-[var(--muted)] mt-1">Across all enrolled tracks</p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center">
              <RadialBars
                data={SKILL_MASTERY.map((s) => ({ label: s.category, value: s.mastery, color: s.color }))}
                size={200}
              />
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {SKILL_MASTERY.map((s) => (
                <li key={s.category} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="truncate">{s.category}</span>
                  </span>
                  <span className="text-[var(--muted)] tabular-nums">{s.mastery}%</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Quiz scores + Hours by category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz scores over time</CardTitle>
              <p className="text-xs text-[var(--muted)] mt-1">Last 12 attempts · trending up</p>
            </div>
            <Badge variant="success">
              <Icon.TrendingUp size={12} /> Avg {Math.round(
                QUIZ_SCORE_HISTORY.reduce((s, q) => s + q.score, 0) / QUIZ_SCORE_HISTORY.length,
              )}%
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <LineChart data={quizLineData} yFormatter={(v) => `${Math.round(v)}%`} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours by category</CardTitle>
            <p className="text-xs text-[var(--muted)] mt-1">This semester</p>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <BarChart
                data={HOURS_BY_CATEGORY}
                valueLabel={(v) => `${v}h`}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Time-of-day + Upcoming deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Best study hours</CardTitle>
            <p className="text-xs text-[var(--muted)] mt-1">When you focus most</p>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2.5">
              {STUDY_TIME_OF_DAY.map((b) => {
                const max = Math.max(...STUDY_TIME_OF_DAY.map((x) => x.minutes), 1);
                const pct = (b.minutes / max) * 100;
                return (
                  <li key={b.bucket} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-10 shrink-0 tabular-nums">{b.bucket}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted-2)] w-12 text-right tabular-nums">{b.minutes}m</span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming deadlines</CardTitle>
            <Link href="/assignments" className="text-xs text-[var(--primary)] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {DEFAULT_DEADLINES.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-2)]/60">
                <div className="h-9 w-9 rounded-lg bg-[var(--amber-soft)] text-[var(--amber)] flex items-center justify-center shrink-0">
                  <Icon.Calendar size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="text-xs text-[var(--muted)]">{d.course}</p>
                </div>
                <span className="text-xs text-[var(--amber)] font-semibold whitespace-nowrap self-center">{d.due}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Continue learning */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Continue learning</CardTitle>
          <Link href="/my-courses" className="text-xs text-[var(--primary)] hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardBody>
          {inProgress.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-6">
              No courses in progress yet. <Link href="/explore" className="text-[var(--primary)]">Browse the catalog</Link>.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inProgress.slice(0, 3).map((e) => {
                const course = COURSES.find((c) => c.id === e.courseId)!;
                return (
                  <Link key={e.courseId} href={`/my-courses/${course.id}`} className="group">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)] transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={course.thumbnail} alt="" className="w-full h-28 object-cover" />
                      <div className="p-4">
                        <p className="text-sm font-semibold line-clamp-1 group-hover:text-[var(--primary)]">
                          {course.title}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-0.5 mb-3">{course.instructor}</p>
                        <Progress value={e.progress} />
                        <p className="text-xs text-[var(--muted)] mt-1.5">{e.progress}% complete</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Live sessions + Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming live sessions</CardTitle>
            <Link href="/live" className="text-xs text-[var(--primary)] hover:underline">
              Browse all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {UPCOMING_LIVE_SESSIONS.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)]">
                <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Icon.Video size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {s.host} · {s.course}
                  </p>
                </div>
                <span className="text-xs text-[var(--primary)] font-semibold whitespace-nowrap self-center">
                  {s.at}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent badges</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            {RECENT_BADGES.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-[var(--border)] p-3 hover:shadow-md transition"
                title={b.description}
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--amber-soft)] text-[var(--amber)] flex items-center justify-center">
                  {BADGE_ICONS[b.icon as keyof typeof BADGE_ICONS] ?? <Icon.Award size={20} />}
                </div>
                <p className="text-xs font-semibold mt-2 line-clamp-1">{b.name}</p>
                <p className="text-[10px] text-[var(--muted-2)] mt-0.5">{b.earnedAt}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Leaderboard + Recommended next */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Friends leaderboard</CardTitle>
            <p className="text-xs text-[var(--muted)] mt-1">Study hours this week</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {LEADERBOARD.map((row, i) => {
              const max = Math.max(...LEADERBOARD.map((r) => r.hours));
              const pct = (row.hours / max) * 100;
              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-[var(--muted-2)] w-4 text-right tabular-nums">{i + 1}.</span>
                      <span className={row.you ? "font-semibold text-[var(--primary)]" : ""}>
                        {row.name}
                      </span>
                    </span>
                    <span className="text-[var(--muted)] tabular-nums">{row.hours.toFixed(1)}h</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className={
                        "h-full rounded-full " +
                        (row.you
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--muted-2)]/60")
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recommended next</CardTitle>
            <Badge variant="primary">
              <Icon.Sparkles size={12} /> AI picks
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {RECOMMENDED_NEXT.map((r) => (
              <Link
                key={r.id}
                href="/my-courses"
                className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] transition group"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Icon.PlayCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate group-hover:text-[var(--primary)]">{r.title}</p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {r.course} · {r.durationMin}m · {r.reason}
                  </p>
                </div>
                <Icon.ChevronRight size={16} className="text-[var(--muted-2)] self-center" />
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
              <Sparkline data={QUIZ_SCORE_HISTORY.map((q) => q.score)} width={120} height={28} />
              <span>Your quiz performance is trending up</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent announcements</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {DEFAULT_ANNOUNCEMENTS.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                <Icon.Megaphone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{a.author}</span>{" "}
                  <span className="text-xs text-[var(--muted)]">· {a.role} · {a.when}</span>
                </p>
                <p className="text-sm text-[var(--muted)] mt-0.5">{a.message}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
