"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EmptyState, Input, Tabs } from "@/components/ui";
import Icon from "@/components/icons";
import { useTeacher } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";

type NType = "enrollment" | "submission" | "quiz" | "review" | "system";

type TeacherNotification = {
  id: string;
  type: NType;
  title: string;
  message: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

const TYPE_INFO: Record<NType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  enrollment: {
    label: "Enrollments",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary-soft)]",
    border: "border-[var(--primary)]/20",
    icon: <Icon.Users size={16} />,
  },
  submission: {
    label: "Submissions",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: <Icon.FilePen size={16} />,
  },
  quiz: {
    label: "Quizzes",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: <Icon.ListChecks size={16} />,
  },
  review: {
    label: "Reviews",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <Icon.Star size={16} />,
  },
  system: {
    label: "System",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: <Icon.Bell size={16} />,
  },
};

const BADGE_VARIANTS: Record<NType, "primary" | "warning" | "default" | "success" | "info"> = {
  enrollment: "primary",
  submission: "warning",
  quiz: "default",
  review: "success",
  system: "info",
};

const LS_KEY = "teacher-notif-read";

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveReadSet(ids: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...ids])); } catch { /* noop */ }
}

type AssignmentData = {
  id: string; title: string; courseTitle: string;
  submissions: { studentName: string; submittedAt: string }[];
};
type QuizData = {
  id: string; title: string; courseTitle: string;
  attempts: { studentName: string; completedAt: string; percentage: number }[];
};

function buildNotifications(
  students: ReturnType<ReturnType<typeof useTeacher>["myStudents"]>,
  assignments: AssignmentData[],
  quizzes: QuizData[],
): Omit<TeacherNotification, "read">[] {
  const now = new Date();
  const items: Omit<TeacherNotification, "read">[] = [];

  // Recent enrollments
  [...students]
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 6)
    .forEach((s) => {
      items.push({
        id: `enroll-${s.userId}-${s.courseId}`,
        type: "enrollment",
        title: `${s.userName} enrolled in ${s.courseTitle}`,
        message: `A new student joined your course. Current progress: ${s.progress}%.`,
        href: "/teacher/students",
        createdAt: s.enrolledAt,
      });
    });

  // Assignment submissions
  const submits: { title: string; course: string; student: string; at: string; aId: string }[] = [];
  for (const a of assignments) {
    for (const sub of a.submissions) {
      submits.push({ title: a.title, course: a.courseTitle, student: sub.studentName, at: sub.submittedAt, aId: a.id });
    }
  }
  submits
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8)
    .forEach((s) => {
      items.push({
        id: `submit-${s.aId}-${s.student}-${s.at}`,
        type: "submission",
        title: `${s.student} submitted "${s.title}"`,
        message: `New submission in ${s.course}. Review and grade it from Assignments.`,
        href: "/teacher/assignments",
        createdAt: s.at,
      });
    });

  // Quiz attempts
  const attempts: { title: string; course: string; student: string; at: string; pct: number; qId: string }[] = [];
  for (const q of quizzes) {
    for (const a of q.attempts) {
      attempts.push({ title: q.title, course: q.courseTitle, student: a.studentName, at: a.completedAt, pct: a.percentage, qId: q.id });
    }
  }
  attempts
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6)
    .forEach((a) => {
      items.push({
        id: `quiz-${a.qId}-${a.student}-${a.at}`,
        type: "quiz",
        title: `${a.student} completed "${a.title}"`,
        message: `Scored ${a.pct}% on the quiz in ${a.course}.`,
        href: "/teacher/quizzes",
        createdAt: a.at,
      });
    });

  // Static system notifications
  items.push(
    {
      id: "sys-review-tip",
      type: "review",
      title: "Students have left course reviews",
      message: "Check your latest reviews and respond to build trust with your learners.",
      href: "/teacher/reviews",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "sys-live-reminder",
      type: "system",
      title: "Schedule your next live class",
      message: "Regular live sessions help students stay engaged. Schedule one from the Live Classes page.",
      href: "/teacher/live",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "sys-welcome",
      type: "system",
      title: "Welcome to your teacher portal",
      message: "Track enrollments, grade submissions, run quizzes, and host live classes — all from one place.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString(),
    },
  );

  const seen = new Set<string>();
  return items
    .filter((n) => { if (seen.has(n.id)) return false; seen.add(n.id); return true; })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

type ReadFilter = "all" | "unread";
type TypeFilter = NType | "all";

export default function TeacherNotificationsPage() {
  const teacher = useTeacher();
  const students = teacher.myStudents();

  const [assignments, setAssignments] = React.useState<AssignmentData[]>([]);
  const [quizzes, setQuizzes] = React.useState<QuizData[]>([]);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [readFilter, setReadFilter] = React.useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [search, setSearch] = React.useState("");
  const [sortDesc, setSortDesc] = React.useState(true);
  const [inboxOpen, setInboxOpen] = React.useState(true);

  React.useEffect(() => {
    setReadIds(loadReadSet());
    fetch("/api/teacher/assignments")
      .then((r) => r.ok ? r.json() : { assignments: [] })
      .then((d) => setAssignments(d.assignments ?? []));
    fetch("/api/teacher/quizzes")
      .then((r) => r.ok ? r.json() : { quizzes: [] })
      .then((d) => setQuizzes(d.quizzes ?? []));
  }, []);

  const rawNotifs = React.useMemo(
    () => buildNotifications(students, assignments, quizzes),
    [students, assignments, quizzes],
  );

  const notifs: TeacherNotification[] = React.useMemo(
    () =>
      rawNotifs
        .filter((n) => !dismissedIds.has(n.id))
        .map((n) => ({ ...n, read: readIds.has(n.id) })),
    [rawNotifs, readIds, dismissedIds],
  );

  const unreadCount = notifs.filter((n) => !n.read).length;
  const readCount = notifs.filter((n) => n.read).length;

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev).add(id);
      saveReadSet(next);
      return next;
    });
  }

  function markAllRead() {
    const next = new Set(notifs.map((n) => n.id));
    setReadIds(next);
    saveReadSet(next);
  }

  function dismiss(id: string) {
    markRead(id);
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  function clearRead() {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      notifs.filter((n) => n.read).forEach((n) => next.add(n.id));
      return next;
    });
  }

  const typeCounts = (Object.keys(TYPE_INFO) as NType[]).map((t) => ({
    type: t,
    total: notifs.filter((n) => n.type === t).length,
    unread: notifs.filter((n) => n.type === t && !n.read).length,
  }));

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifs
      .filter((n) => readFilter === "all" || !n.read)
      .filter((n) => typeFilter === "all" || n.type === typeFilter)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortDesc ? diff : -diff;
      });
  }, [notifs, readFilter, typeFilter, search, sortDesc]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-[var(--muted)]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={readFilter}
            onChange={(v) => setReadFilter(v as ReadFilter)}
            options={[
              { value: "all", label: "All", count: notifs.length },
              { value: "unread", label: "Unread", count: unreadCount },
            ]}
          />
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Icon.Check size={14} /> Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={clearRead} disabled={readCount === 0}>
            <Icon.Trash size={14} /> Clear read
          </Button>
        </div>
      </div>

      {/* Type summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {typeCounts.map(({ type, total, unread }) => {
          const info = TYPE_INFO[type];
          const active = typeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(active ? "all" : type)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
                active
                  ? `${info.bg} ${info.border} ring-2 ring-[var(--primary)]/30`
                  : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
            >
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", info.bg, info.color)}>
                {info.icon}
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">{info.label}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">{total}</span>
                {unread > 0 && (
                  <span className="text-xs text-[var(--primary)] font-semibold">{unread} new</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {typeFilter !== "all" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">Filtering by:</span>
          <Badge variant="primary" className="gap-1">
            {TYPE_INFO[typeFilter].label}
            <button onClick={() => setTypeFilter("all")} className="ml-1 hover:opacity-70 transition">
              <Icon.X size={11} />
            </button>
          </Badge>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>
              {typeFilter !== "all" ? `${TYPE_INFO[typeFilter].label} notifications` : "Inbox"}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-48">
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Icon.Search size={14} />}
                />
              </div>
              <button
                type="button"
                onClick={() => setSortDesc((d) => !d)}
                className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)] transition-all"
              >
                <Icon.ArrowUp size={13} className={cn("transition-transform", !sortDesc && "rotate-180")} />
                {sortDesc ? "Newest" : "Oldest"}
              </button>
              <span className="text-xs text-[var(--muted)]">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setInboxOpen((v) => !v)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all"
              >
                <Icon.ChevronDown
                  size={18}
                  className={cn("transition-transform duration-200", !inboxOpen && "-rotate-90")}
                />
              </button>
            </div>
          </div>
        </CardHeader>

        {inboxOpen && (
          <CardBody className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Icon.Bell size={28} />}
                title={
                  search ? "No results found"
                    : typeFilter !== "all" ? `No ${TYPE_INFO[typeFilter].label.toLowerCase()} notifications`
                      : readFilter === "unread" ? "All caught up"
                        : "No notifications yet"
                }
                description={
                  search ? `No notifications match "${search}".`
                    : readFilter === "unread" ? "No unread notifications right now."
                      : "Student enrollments, submissions, and quiz results will appear here."
                }
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {filtered.map((n) => {
                  const info = TYPE_INFO[n.type];
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "px-4 py-4 flex gap-3 items-start group transition-colors",
                        !n.read && "bg-[var(--primary-soft)]/20",
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", info.bg, info.color)}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold leading-snug">{n.title}</p>
                          <Badge variant={BADGE_VARIANTS[n.type]}>{info.label}</Badge>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />}
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-xs text-[var(--muted-2)]">{relativeTime(n.createdAt)}</p>
                          {n.href && (
                            <Link
                              href={n.href}
                              className="text-xs text-[var(--primary)] hover:underline font-medium"
                              onClick={() => markRead(n.id)}
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            title="Mark as read"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                          >
                            <Icon.Check size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(n.id)}
                          title="Dismiss"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition"
                        >
                          <Icon.Trash size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        )}
      </Card>
    </div>
  );
}
