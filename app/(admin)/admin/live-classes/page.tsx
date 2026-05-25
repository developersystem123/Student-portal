"use client";

import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  Tabs,
  Textarea,
  useToast,
} from "@/components/ui";
import Icon from "@/components/icons";
import { useData } from "@/lib/store";
import { formatDate, formatTime } from "@/lib/utils";

type LiveStatus = "upcoming" | "live" | "ended" | "cancelled";

type LiveClass = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  instructor: string;
  meetingUrl: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveStatus;
  attendees: number;
  maxAttendees?: number;
};

const STATUS_BADGE: Record<LiveStatus, "info" | "success" | "default" | "danger"> = {
  upcoming: "info",
  live: "success",
  ended: "default",
  cancelled: "danger",
};

const STATUSES: LiveStatus[] = ["upcoming", "live", "ended", "cancelled"];
type Filter = "all" | LiveStatus;
type SortKey = "date-asc" | "date-desc" | "attendees-high";

type FormState = {
  courseId: string;
  title: string;
  description: string;
  meetingUrl: string;
  scheduledAt: string;
  durationMinutes: string;
  status: LiveStatus;
  maxAttendees: string;
};

const emptyForm: FormState = {
  courseId: "",
  title: "",
  description: "",
  meetingUrl: "https://",
  scheduledAt: "",
  durationMinutes: "60",
  status: "upcoming",
  maxAttendees: "",
};

const PAGE_SIZE = 10;

export default function AdminLiveClassesPage() {
  const { courses } = useData();
  const toast = useToast();

  const [classes, setClasses] = React.useState<LiveClass[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("date-asc");
  const [instructorFilter, setInstructorFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LiveClass | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<LiveClass | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/live-classes");
    const data = await r.json();
    setClasses(data.classes ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(
    () => ({
      all: classes.length,
      upcoming: classes.filter((c) => c.status === "upcoming").length,
      live: classes.filter((c) => c.status === "live").length,
      ended: classes.filter((c) => c.status === "ended").length,
      cancelled: classes.filter((c) => c.status === "cancelled").length,
    }),
    [classes],
  );

  const liveStats = React.useMemo(() => {
    const liveNow = classes.filter((c) => c.status === "live").length;
    const upcoming = classes.filter((c) => c.status === "upcoming").length;
    const totalAttendees = classes.reduce((s, c) => s + c.attendees, 0);
    const withAttendees = classes.filter((c) => c.attendees > 0);
    const avgAttendees =
      withAttendees.length > 0
        ? Math.round(withAttendees.reduce((s, c) => s + c.attendees, 0) / withAttendees.length)
        : 0;
    return { liveNow, upcoming, totalAttendees, avgAttendees };
  }, [classes]);

  const uniqueInstructors = React.useMemo(() => {
    const set = new Set(classes.map((c) => c.instructor).filter(Boolean));
    return Array.from(set).sort();
  }, [classes]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = classes.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (instructorFilter !== "all" && c.instructor !== instructorFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "date-asc") return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      if (sortKey === "date-desc") return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      if (sortKey === "attendees-high") return b.attendees - a.attendees;
      return 0;
    });

    return result;
  }, [classes, filter, query, sortKey, instructorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filter, query, sortKey, instructorFilter]);

  const activeFilters = React.useMemo(() => {
    let n = 0;
    if (query.trim()) n++;
    if (instructorFilter !== "all") n++;
    if (sortKey !== "date-asc") n++;
    return n;
  }, [query, instructorFilter, sortKey]);

  function clearFilters() {
    setQuery("");
    setInstructorFilter("all");
    setSortKey("date-asc");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(c: LiveClass) {
    setEditing(c);
    setForm({
      courseId: c.courseId,
      title: c.title,
      description: c.description,
      meetingUrl: c.meetingUrl,
      scheduledAt: c.scheduledAt.slice(0, 16),
      durationMinutes: String(c.durationMinutes),
      status: c.status,
      maxAttendees: c.maxAttendees ? String(c.maxAttendees) : "",
    });
    setFormOpen(true);
  }

  async function submit() {
    setSaving(true);
    const payload = {
      courseId: form.courseId,
      title: form.title,
      description: form.description,
      meetingUrl: form.meetingUrl,
      scheduledAt: form.scheduledAt,
      durationMinutes: Number(form.durationMinutes),
      status: form.status,
      maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
    };
    const r = await fetch(
      editing ? `/api/admin/live-classes/${editing.id}` : "/api/admin/live-classes",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      toast.push({ title: "Couldn't save live class", description: e.error, tone: "danger" });
      return;
    }
    toast.push({ title: editing ? "Live class updated" : "Live class scheduled", tone: "success" });
    setFormOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const r = await fetch(`/api/admin/live-classes/${deleting.id}`, { method: "DELETE" });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      toast.push({ title: "Couldn't delete", description: e.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Live class deleted", tone: "info" });
    setDeleting(null);
    load();
  }

  const formValid =
    form.courseId &&
    form.title.trim().length >= 3 &&
    /^https?:\/\/\S+$/.test(form.meetingUrl.trim()) &&
    form.scheduledAt &&
    Number(form.durationMinutes) >= 5;

  function exportCsv() {
    const header = [
      "Title", "Course", "Instructor", "Date", "Duration", "Attendees",
      "MaxAttendees", "Status", "MeetingUrl",
    ];
    const rows = filtered.map((c) => [
      c.title.replace(/"/g, '""'),
      c.courseTitle.replace(/"/g, '""'),
      c.instructor,
      c.scheduledAt,
      String(c.durationMinutes),
      String(c.attendees),
      c.maxAttendees ? String(c.maxAttendees) : "",
      c.status,
      c.meetingUrl,
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "live-classes.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "CSV exported", tone: "success" });
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "date-asc", label: "Date ↑" },
    { key: "date-desc", label: "Date ↓" },
    { key: "attendees-high", label: "Attendees ↓" },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Live Classes</h1>
          <p className="mt-1 text-muted">
            Schedule and manage live online sessions across all courses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Icon.Download size={15} /> Export CSV
          </Button>
          <Button onClick={openCreate}>
            <Icon.Plus size={16} /> Schedule class
          </Button>
        </div>
      </div>

      {/* Stat cards — always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Live now",
            value: liveStats.liveNow,
            icon: <Icon.Video size={16} />,
            tint: liveStats.liveNow > 0 ? "bg-rose-500/15 text-rose-500" : "bg-surface-2 text-muted",
          },
          {
            label: "Upcoming",
            value: liveStats.upcoming,
            icon: <Icon.Calendar size={16} />,
            tint: "bg-[var(--primary-soft)] text-primary",
          },
          {
            label: "Total attendees",
            value: liveStats.totalAttendees,
            icon: <Icon.Users size={16} />,
            tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
          },
          {
            label: "Avg attendees",
            value: liveStats.avgAttendees || "—",
            icon: <Icon.BarChart3 size={16} />,
            tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 py-3!">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>{s.icon}</div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted">{s.label}</p>
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs (left) + Search & Sort (right) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <Tabs
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "upcoming", label: "Upcoming", count: counts.upcoming },
            { value: "live", label: "Live", count: counts.live },
            { value: "ended", label: "Ended", count: counts.ended },
            { value: "cancelled", label: "Cancelled", count: counts.cancelled },
          ]}
        />
        <div className="flex flex-col items-end gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, instructor, or course…"
            icon={<Icon.Search size={16} />}
            className="w-full sm:w-80"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="text-sm text-muted font-medium mr-1">{filtered.length} class{filtered.length !== 1 ? "es" : ""}</p>
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-xs text-muted font-medium mr-1">Sort:</span>
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setSortKey(o.key)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition ${sortKey === o.key ? "bg-[var(--primary)] text-white" : "border border-border text-muted hover:bg-surface-2"}`}
              >
                {o.label}
              </button>
            ))}
            {uniqueInstructors.length > 0 && (
              <>
                <span className="text-xs text-muted font-medium ml-3 mr-1">Instructor:</span>
                <button
                  onClick={() => setInstructorFilter("all")}
                  className={`h-8 px-3 rounded-lg text-xs font-medium transition ${instructorFilter === "all" ? "bg-[var(--primary)] text-white" : "border border-border text-muted hover:bg-surface-2"}`}
                >
                  All
                </button>
                {uniqueInstructors.map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setInstructorFilter(inst)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition ${instructorFilter === inst ? "bg-[var(--primary)] text-white" : "border border-border text-muted hover:bg-surface-2"}`}
                  >
                    {inst}
                  </button>
                ))}
              </>
            )}
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs px-2.5 py-1.5 rounded-lg text-primary bg-primary-soft hover:opacity-80 transition flex items-center gap-1"
              >
                <Icon.X size={11} /> Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-12 text-muted">
              <Icon.Loader size={18} /> Loading…
            </div>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.Video size={28} />}
              title={classes.length === 0 ? "No live classes yet" : "No matching classes"}
              description={
                classes.length === 0
                  ? "Schedule your first live session."
                  : "Try a different filter."
              }
              action={
                classes.length === 0 ? (
                  <Button onClick={openCreate}>
                    <Icon.Plus size={16} /> Schedule class
                  </Button>
                ) : undefined
              }
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-muted text-xs uppercase tracking-wider">
                  <tr>
                    <Th>Session</Th>
                    <Th>Course</Th>
                    <Th>When</Th>
                    <Th>Attendees</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-(--surface-2)/50"
                    >
                      <Td>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted">{c.instructor}</div>
                      </Td>
                      <Td>
                        <div className="truncate max-w-[20ch]">{c.courseTitle}</div>
                      </Td>
                      <Td>
                        <div>{formatDate(c.scheduledAt)}</div>
                        <div className="text-xs text-muted">
                          {formatTime(c.scheduledAt)} · {c.durationMinutes} min
                        </div>
                      </Td>
                      <Td className="text-xs">
                        {c.attendees}
                        {c.maxAttendees ? ` / ${c.maxAttendees}` : ""}
                      </Td>
                      <Td>
                        <Badge variant={STATUS_BADGE[c.status]} className="capitalize">
                          {c.status}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" title="Open meeting link">
                              <Icon.Video size={14} />
                            </Button>
                          </a>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(c)} title="Edit">
                            <Icon.Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleting(c)}
                            title="Delete"
                          >
                            <Icon.Trash size={14} />
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} classes
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <Icon.ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${
                          safePage === p
                            ? "bg-[var(--primary)] text-white"
                            : "border border-border text-foreground hover:bg-surface-2"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <Icon.ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={editing ? "Edit live class" : "Schedule live class"}
      >
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Course</Label>
              <Select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Session title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Live Q&A — Week 3"
                maxLength={120}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this session covers…"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Meeting URL</Label>
              <Input
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                placeholder="https://meet.example.com/abc"
              />
            </div>
            <div>
              <Label>Date &amp; time</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={600}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LiveStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Max attendees (optional)</Label>
              <Input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving} disabled={!formValid}>
              <Icon.Save size={16} /> {editing ? "Save changes" : "Schedule"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} size="sm" title="Delete live class?">
        {deleting && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Delete <strong className="text-foreground">{deleting.title}</strong>? This
              can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                <Icon.Trash size={16} /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold px-4 py-3 ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}
