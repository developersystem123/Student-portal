"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EmptyState, Input, Tabs } from "@/components/ui";
import Icon from "@/components/icons";
import { useAdmin } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type NType = "student" | "application" | "support" | "payment" | "system";

type AdminNotification = {
  id: string;
  type: NType;
  title: string;
  message: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

// ── Static config ─────────────────────────────────────────────────────────────

const TYPE_INFO: Record<NType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  student: {
    label: "Students",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary-soft)]",
    border: "border-[var(--primary)]/20",
    icon: <Icon.User size={16} />,
  },
  application: {
    label: "Applications",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: <Icon.Calendar size={16} />,
  },
  support: {
    label: "Support",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: <Icon.MessageSquare size={16} />,
  },
  payment: {
    label: "Payments",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <Icon.CreditCard size={16} />,
  },
  system: {
    label: "System",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: <Icon.Settings size={16} />,
  },
};

const BADGE_VARIANTS: Record<NType, "primary" | "warning" | "default" | "success" | "info"> = {
  student: "primary",
  application: "warning",
  support: "default",
  payment: "success",
  system: "info",
};

const LS_KEY = "admin-notif-read";

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadSet(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch { /* noop */ }
}

// ── Derive notifications from admin store data ─────────────────────────────────

function deriveNotifications(
  stats: ReturnType<ReturnType<typeof useAdmin>["stats"]>,
  students: ReturnType<ReturnType<typeof useAdmin>["listStudents"]>,
  applications: ReturnType<ReturnType<typeof useAdmin>["listApplications"]>,
): Omit<AdminNotification, "read">[] {
  const now = new Date();
  const items: Omit<AdminNotification, "read">[] = [];

  // System-level alerts
  if (stats.pendingApplications > 0) {
    items.push({
      id: "sys-pending-apps",
      type: "application",
      title: `${stats.pendingApplications} application${stats.pendingApplications > 1 ? "s" : ""} awaiting review`,
      message: "In-person class applications have been submitted and are waiting for an admin decision.",
      href: "/admin/applications",
      createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
    });
  }

  // Recent students (last 5)
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  for (const s of recentStudents) {
    items.push({
      id: `student-${s.id}`,
      type: "student",
      title: `${s.name} joined the platform`,
      message: `New student registration from ${s.email}. They have ${s.enrolledCount} course${s.enrolledCount !== 1 ? "s" : ""} enrolled.`,
      href: "/admin/students",
      createdAt: s.createdAt ?? new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 72).toISOString(),
    });
  }

  // Pending applications
  const pendingApps = applications.filter((a) => a.status === "pending").slice(0, 4);
  for (const app of pendingApps) {
    items.push({
      id: `app-${app.id}`,
      type: "application",
      title: `Application pending: ${app.studentName}`,
      message: `${app.studentName} applied for an in-person class at ${app.campus}. Review and approve or reject.`,
      href: "/admin/applications",
      createdAt: app.submittedAt,
    });
  }

  // Static system notifications (platform events)
  items.push(
    {
      id: "sys-platform-health",
      type: "system",
      title: "Platform health check passed",
      message: "All services are operational. Database, API, and CDN are running normally.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "sys-payment-summary",
      type: "payment",
      title: "Weekly payment summary ready",
      message: "Your weekly revenue report is ready. View detailed breakdowns on the Payments page.",
      href: "/admin/payments",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "sys-new-review",
      type: "system",
      title: "New course reviews submitted",
      message: "Students have posted new reviews on several courses. Review and moderate as needed.",
      href: "/admin/reviews",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "sys-support-open",
      type: "support",
      title: "Open support tickets need attention",
      message: "There are unresolved support tickets waiting for a response. Assign agents to reduce wait time.",
      href: "/admin/support",
      createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "sys-cert-batch",
      type: "system",
      title: "Certificate batch processing complete",
      message: "Certificates have been issued to eligible students who completed their courses this week.",
      href: "/admin/certificates",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "pay-stripe-payout",
      type: "payment",
      title: "Teacher payout processed",
      message: "Monthly instructor payout has been initiated. Funds will reach instructors within 2-3 business days.",
      href: "/admin/payments",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
    },
    {
      id: "sys-backup",
      type: "system",
      title: "Scheduled backup completed",
      message: "Daily automated backup finished successfully. All user and course data is secured.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    },
  );

  // Deduplicate by id and sort newest first
  const seen = new Set<string>();
  return items
    .filter((n) => { if (seen.has(n.id)) return false; seen.add(n.id); return true; })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ── Page ─────────────────────────────────────────────────────────────────────

type ReadFilter = "all" | "unread";
type TypeFilter = NType | "all";

export default function AdminNotificationsPage() {
  const admin = useAdmin();
  const stats = admin.stats();
  const students = admin.listStudents();
  const applications = admin.listApplications();

  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [readFilter, setReadFilter] = React.useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [search, setSearch] = React.useState("");
  const [sortDesc, setSortDesc] = React.useState(true);
  const [inboxOpen, setInboxOpen] = React.useState(true);

  React.useEffect(() => {
    setReadIds(loadReadSet());
  }, []);

  const rawNotifs = React.useMemo(
    () => deriveNotifications(stats, students, applications),
    [stats, students, applications],
  );

  const notifs: AdminNotification[] = React.useMemo(
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
    const readList = notifs.filter((n) => n.read).map((n) => n.id);
    setDismissedIds((prev) => {
      const next = new Set(prev);
      readList.forEach((id) => next.add(id));
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-[var(--muted)]">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""} require your attention`
              : "You're all caught up — no unread alerts"}
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

      {/* Active type filter pill */}
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

      {/* Inbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>
              {typeFilter !== "all" ? `${TYPE_INFO[typeFilter].label} alerts` : "Activity feed"}
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
                title={sortDesc ? "Showing newest first" : "Showing oldest first"}
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
                aria-label={inboxOpen ? "Collapse" : "Expand"}
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
                  search
                    ? "No results found"
                    : typeFilter !== "all"
                      ? `No ${TYPE_INFO[typeFilter].label.toLowerCase()} alerts`
                      : readFilter === "unread"
                        ? "All caught up"
                        : "No notifications"
                }
                description={
                  search
                    ? `No alerts match "${search}".`
                    : readFilter === "unread"
                      ? "No unread alerts right now — check back later."
                      : "Platform events, student activity, and payment alerts will appear here."
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
