"use client";

import * as React from "react";
import Icon from "@/components/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  Tabs,
  useToast,
} from "@/components/ui";
import { useAdmin, type EnrollmentRow } from "@/lib/store";
import { relativeTime, formatDate } from "@/lib/utils";

type Filter = "all" | "in-progress" | "completed" | "certified";
type SortKey = "student" | "course" | "enrolled" | "progress" | "status";
type SortDir = "asc" | "desc";
type DateRange = "all" | "7d" | "30d" | "90d";

const PAGE_SIZES = [10, 25, 50] as const;

const ALL_COLS = ["student", "course", "enrolled", "progress", "status", "action"] as const;
type ColKey = typeof ALL_COLS[number];
const COL_LABELS: Record<ColKey, string> = {
  student: "Student", course: "Course", enrolled: "Enrolled",
  progress: "Progress", status: "Status", action: "Action",
};

function statusOrder(r: EnrollmentRow) {
  if (r.certificateId) return 3;
  if (r.completed) return 2;
  if (r.progress > 0) return 1;
  return 0;
}

function statusLabel(r: EnrollmentRow) {
  if (r.certificateId) return "Certified";
  if (r.completed) return "Completed";
  if (r.progress > 0) return "In progress";
  return "Not started";
}

export default function AdminEnrollmentsPage() {
  const admin = useAdmin();
  const toast = useToast();
  const [tick, setTick] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [awardRow, setAwardRow] = React.useState<EnrollmentRow | null>(null);
  const [revokeRow, setRevokeRow] = React.useState<EnrollmentRow | null>(null);
  const [detailRow, setDetailRow] = React.useState<EnrollmentRow | null>(null);
  const [score, setScore] = React.useState("90");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [sortKey, setSortKey] = React.useState<SortKey>("enrolled");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = React.useState<"award" | "revoke" | null>(null);
  const [bulkScore, setBulkScore] = React.useState("90");

  // New filter states
  const [dateRange, setDateRange] = React.useState<DateRange>("all");
  const [minProgress, setMinProgress] = React.useState(0);
  const [maxProgress, setMaxProgress] = React.useState(100);
  const [showFilters, setShowFilters] = React.useState(false);
  const [visibleCols, setVisibleCols] = React.useState<Set<ColKey>>(new Set(ALL_COLS));
  const [showColToggle, setShowColToggle] = React.useState(false);
  const colToggleRef = React.useRef<HTMLDivElement>(null);

  const rows = React.useMemo(() => admin.listEnrollments(), [admin, tick]);
  function refresh() { setTick((t) => t + 1); }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function toggleCol(col: ColKey) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(col) && next.size > 2) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  // Close col toggle on outside click
  React.useEffect(() => {
    if (!showColToggle) return;
    function handler(e: MouseEvent) {
      if (colToggleRef.current && !colToggleRef.current.contains(e.target as Node))
        setShowColToggle(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColToggle]);

  const dateThreshold = React.useMemo(() => {
    if (dateRange === "all") return null;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [dateRange]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = rows.filter((r) => {
      if (filter === "in-progress" && (r.completed || r.progress === 0)) return false;
      if (filter === "completed" && !r.completed) return false;
      if (filter === "certified" && !r.certificateId) return false;
      if (dateThreshold && new Date(r.enrolledAt).getTime() < dateThreshold) return false;
      if (r.progress < minProgress || r.progress > maxProgress) return false;
      if (!q) return true;
      return (
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q)
      );
    });
    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "student") cmp = a.userName.localeCompare(b.userName);
      else if (sortKey === "course") cmp = a.courseTitle.localeCompare(b.courseTitle);
      else if (sortKey === "enrolled") cmp = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
      else if (sortKey === "progress") cmp = a.progress - b.progress;
      else if (sortKey === "status") cmp = statusOrder(a) - statusOrder(b);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, query, filter, sortKey, sortDir, dateThreshold, minProgress, maxProgress]);

  const activeFiltersCount = (dateRange !== "all" ? 1 : 0) + (minProgress > 0 || maxProgress < 100 ? 1 : 0);

  function resetFilters() {
    setDateRange("all");
    setMinProgress(0);
    setMaxProgress(100);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  React.useEffect(() => { setPage(1); setSelected(new Set()); }, [filter, query, pageSize, dateRange, minProgress, maxProgress]);

  const counts = React.useMemo(() => ({
    all: rows.length,
    "in-progress": rows.filter((r) => !r.completed && r.progress > 0).length,
    completed: rows.filter((r) => r.completed).length,
    certified: rows.filter((r) => !!r.certificateId).length,
  }), [rows]);

  const pageKeys = paginated.map((r) => `${r.userId}-${r.courseId}`);
  const allPageSelected = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const somePageSelected = pageKeys.some((k) => selected.has(k));

  function toggleRow(key: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }
  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageKeys.forEach((k) => next.delete(k));
      else pageKeys.forEach((k) => next.add(k));
      return next;
    });
  }
  function clearSelection() { setSelected(new Set()); }

  const selectedRows = filtered.filter((r) => selected.has(`${r.userId}-${r.courseId}`));
  const canBulkAward = selectedRows.some((r) => r.completed && !r.certificateId);
  const canBulkRevoke = selectedRows.some((r) => !!r.certificateId);

  function handleBulkAward() {
    const s = Number(bulkScore);
    if (!Number.isFinite(s) || s < 0 || s > 100) {
      toast.push({ title: "Invalid score", description: "Score must be 0–100.", tone: "danger" }); return;
    }
    const eligible = selectedRows.filter((r) => r.completed && !r.certificateId);
    eligible.forEach((r) => admin.awardCertificateFor(r.userId, r.courseId, s));
    toast.push({ title: `${eligible.length} certificate${eligible.length !== 1 ? "s" : ""} awarded`, tone: "success" });
    setBulkAction(null); clearSelection(); refresh();
  }

  function handleBulkRevoke() {
    const eligible = selectedRows.filter((r) => !!r.certificateId);
    eligible.forEach((r) => admin.revokeCertificate(r.userId, r.certificateId!));
    toast.push({ title: `${eligible.length} certificate${eligible.length !== 1 ? "s" : ""} revoked`, tone: "info" });
    setBulkAction(null); clearSelection(); refresh();
  }

  function handleAward() {
    if (!awardRow) return;
    const s = Number(score);
    if (!Number.isFinite(s) || s < 0 || s > 100) {
      toast.push({ title: "Invalid score", description: "Score must be 0–100.", tone: "danger" }); return;
    }
    admin.awardCertificateFor(awardRow.userId, awardRow.courseId, s);
    toast.push({ title: "Certificate awarded", tone: "success" });
    setAwardRow(null); refresh();
  }

  function handleRevoke() {
    if (!revokeRow || !revokeRow.certificateId) return;
    admin.revokeCertificate(revokeRow.userId, revokeRow.certificateId);
    toast.push({ title: "Certificate revoked", tone: "success" });
    setRevokeRow(null); refresh();
  }

  function exportCsv() {
    const header = "Student,Email,Course,Enrolled,Progress,Status,Certificate\n";
    const csv = filtered.map((r) =>
      [r.userName, r.userEmail, r.courseTitle, r.enrolledAt, `${r.progress}%`, statusLabel(r), r.certificateId ?? ""].join(",")
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  function printView() {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows_html = filtered.map((r) => `
      <tr>
        <td>${r.userName}</td><td>${r.userEmail}</td>
        <td>${r.courseTitle}</td>
        <td>${formatDate ? r.enrolledAt.slice(0, 10) : r.enrolledAt.slice(0, 10)}</td>
        <td>${r.progress}%</td><td>${statusLabel(r)}</td>
      </tr>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Enrollments</title>
      <style>body{font-family:sans-serif;padding:24px}h1{font-size:20px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f3f4f6;text-align:left;padding:8px 12px;border:1px solid #e5e7eb;font-weight:600}
      td{padding:8px 12px;border:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}
      @media print{button{display:none}}</style></head><body>
      <h1>Enrollments — ${new Date().toLocaleDateString()}</h1>
      <p style="color:#6b7280;margin-bottom:16px">${filtered.length} records · Filter: ${filter}</p>
      <table><thead><tr>
        <th>Student</th><th>Email</th><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th>
      </tr></thead><tbody>${rows_html}</tbody></table>
      <script>window.onload=()=>window.print()<\/script></body></html>`);
    win.document.close();
  }

  function ScoreBar({ value }: { value: number }) {
    return (
      <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${value >= 90 ? "bg-emerald-500" : value >= 60 ? "bg-[var(--primary)]" : "bg-red-400"}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }

  function SortTh({ label, sortId, className }: { label: string; sortId: SortKey; className?: string }) {
    const active = sortKey === sortId;
    return (
      <th className={`font-medium py-2.5 px-3 cursor-pointer select-none hover:text-[var(--foreground)] transition-colors ${className ?? ""}`}
        onClick={() => toggleSort(sortId)}>
        <span className="inline-flex items-center gap-1">
          {label}
          <span className={`transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
            {active && sortDir === "desc"
              ? <Icon.ChevronDown size={13} />
              : <Icon.ChevronDown size={13} className="rotate-180" />}
          </span>
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Enrollments</h1>
          <p className="mt-1 text-[var(--muted)]">See who's taking what, award certificates, revoke when needed.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={printView} disabled={filtered.length === 0}>
            <Icon.Printer size={16} /> Print
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Icon.Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.all, tint: "bg-[var(--primary-soft)] text-[var(--primary)]", icon: <Icon.ListChecks size={16} /> },
          { label: "In progress", value: counts["in-progress"], tint: "bg-sky-500/10 text-sky-600", icon: <Icon.PlayCircle size={16} /> },
          { label: "Completed", value: counts.completed, tint: "bg-emerald-500/10 text-emerald-600", icon: <Icon.CheckCircle size={16} /> },
          { label: "Certified", value: counts.certified, tint: "bg-amber-500/10 text-amber-600", icon: <Icon.Award size={16} /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 !py-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>{s.icon}</div>
              <div>
                <p className="text-[11px] text-[var(--muted)]">{s.label}</p>
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {/* Toolbar row 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <Tabs
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "in-progress", label: "In progress", count: counts["in-progress"] },
                { value: "completed", label: "Completed", count: counts.completed },
                { value: "certified", label: "Certified", count: counts.certified },
              ]}
            />
            <div className="flex items-center gap-2">
              <Input
                icon={<Icon.Search size={16} />}
                placeholder="Search student or course…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="sm:max-w-xs"
              />
              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`relative h-10 px-3 rounded-xl border text-sm flex items-center gap-1.5 transition-all ${showFilters || activeFiltersCount > 0 ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--muted)]"}`}
              >
                <Icon.Filter size={15} />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {/* Column visibility */}
              <div ref={colToggleRef} className="relative">
                <button
                  onClick={() => setShowColToggle((v) => !v)}
                  className="h-10 px-3 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--muted)] text-sm flex items-center gap-1.5 transition-all"
                  title="Toggle columns"
                >
                  <Icon.Columns size={15} />
                </button>
                {showColToggle && (
                  <div className="absolute right-0 top-12 z-50 w-44 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold px-2 pb-1">Columns</p>
                    {ALL_COLS.map((col) => (
                      <button
                        key={col}
                        onClick={() => toggleCol(col)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-sm transition"
                      >
                        <span className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${visibleCols.has(col) ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)]"}`}>
                          {visibleCols.has(col) && <Icon.Check size={10} className="text-white" strokeWidth={3} />}
                        </span>
                        {COL_LABELS[col]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Advanced filters</p>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-[var(--primary)] hover:underline">Reset all</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date range */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[var(--muted)]">Enrollment date</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "7d", "30d", "90d"] as DateRange[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDateRange(d)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${dateRange === d ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"}`}
                      >
                        {d === "all" ? "All time" : d === "7d" ? "Last 7 days" : d === "30d" ? "Last 30 days" : "Last 90 days"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Progress range */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--muted)]">Progress range</p>
                    <span className="text-xs font-semibold text-[var(--primary)]">{minProgress}% – {maxProgress}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-[var(--muted-2)]">Min</p>
                      <input
                        type="range" min={0} max={100} step={5}
                        value={minProgress}
                        onChange={(e) => setMinProgress(Math.min(Number(e.target.value), maxProgress))}
                        className="w-full accent-[var(--primary)]"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-[var(--muted-2)]">Max</p>
                      <input
                        type="range" min={0} max={100} step={5}
                        value={maxProgress}
                        onChange={(e) => setMaxProgress(Math.max(Number(e.target.value), minProgress))}
                        className="w-full accent-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden relative">
                    <div
                      className="absolute h-full bg-[var(--primary)] rounded-full"
                      style={{ left: `${minProgress}%`, width: `${maxProgress - minProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/20">
              <span className="text-sm font-medium text-[var(--primary)]">{selected.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                {canBulkAward && (
                  <Button size="sm" variant="soft" onClick={() => { setBulkScore("90"); setBulkAction("award"); }}>
                    <Icon.Award size={14} /> Award certificates
                  </Button>
                )}
                {canBulkRevoke && (
                  <Button size="sm" variant="ghost" onClick={() => setBulkAction("revoke")}>
                    <Icon.Trash size={14} /> Revoke selected
                  </Button>
                )}
                <button onClick={clearSelection} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition">Clear</button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Icon.ListChecks size={20} />}
              title="No matching enrollments."
              description="Try a different filter or clear your search."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 w-10">
                      <input
                        type="checkbox" checked={allPageSelected}
                        ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                        onChange={togglePage}
                        className="accent-[var(--primary)] h-4 w-4 cursor-pointer"
                      />
                    </th>
                    {visibleCols.has("student") && <SortTh label="Student" sortId="student" />}
                    {visibleCols.has("course") && <SortTh label="Course" sortId="course" />}
                    {visibleCols.has("enrolled") && <SortTh label="Enrolled" sortId="enrolled" className="hidden md:table-cell" />}
                    {visibleCols.has("progress") && <SortTh label="Progress" sortId="progress" />}
                    {visibleCols.has("status") && <SortTh label="Status" sortId="status" />}
                    {visibleCols.has("action") && <th className="font-medium py-2.5 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => {
                    const key = `${r.userId}-${r.courseId}`;
                    const isSelected = selected.has(key);
                    return (
                      <tr
                        key={key}
                        className={`border-b border-[var(--border)] last:border-0 transition cursor-pointer ${isSelected ? "bg-[var(--primary-soft)]/40" : "hover:bg-[var(--surface-2)]/50"}`}
                        onClick={() => setDetailRow(r)}
                      >
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox" checked={isSelected}
                            onChange={() => toggleRow(key)}
                            className="accent-[var(--primary)] h-4 w-4 cursor-pointer"
                          />
                        </td>
                        {visibleCols.has("student") && (
                          <td className="py-3 px-3">
                            <p className="font-medium truncate">{r.userName}</p>
                            <p className="text-xs text-[var(--muted)] truncate">{r.userEmail}</p>
                          </td>
                        )}
                        {visibleCols.has("course") && (
                          <td className="py-3 px-3 max-w-xs">
                            <p className="font-medium truncate">{r.courseTitle}</p>
                          </td>
                        )}
                        {visibleCols.has("enrolled") && (
                          <td className="py-3 px-3 hidden md:table-cell text-[var(--muted)] text-xs">
                            {relativeTime(r.enrolledAt)}
                          </td>
                        )}
                        {visibleCols.has("progress") && (
                          <td className="py-3 px-3 w-40">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" style={{ width: `${r.progress}%` }} />
                              </div>
                              <span className="text-xs text-[var(--muted)] w-8 text-right tabular-nums">{r.progress}%</span>
                            </div>
                          </td>
                        )}
                        {visibleCols.has("status") && (
                          <td className="py-3 px-3">
                            {r.certificateId ? <Badge variant="primary"><Icon.Award size={12} /> Certified</Badge>
                              : r.completed ? <Badge variant="success">Completed</Badge>
                              : r.progress > 0 ? <Badge variant="info">In progress</Badge>
                              : <Badge variant="default">Not started</Badge>}
                          </td>
                        )}
                        {visibleCols.has("action") && (
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {r.certificateId ? (
                              <Button size="sm" variant="ghost" onClick={() => setRevokeRow(r)}>
                                <Icon.Trash size={14} /> Revoke
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled={!r.completed}
                                onClick={() => { setScore("90"); setAwardRow(r); }}
                                title={r.completed ? "Award certificate" : "Complete course first"}
                              >
                                <Icon.Award size={14} /> Award
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination + per-page */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)] flex-wrap">
              <div className="flex items-center gap-3">
                <p className="text-sm text-[var(--muted)]">
                  {filtered.length > pageSize
                    ? `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`
                    : `${filtered.length} enrollment${filtered.length !== 1 ? "s" : ""}`}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span>Per page:</span>
                  {PAGE_SIZES.map((n) => (
                    <button key={n} onClick={() => setPageSize(n)}
                      className={`h-6 px-2 rounded-md transition-all ${pageSize === n ? "bg-[var(--primary)] text-white font-medium" : "hover:bg-[var(--surface-2)]"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                    <Icon.ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p); return acc;
                    }, [])
                    .map((p, idx) => p === "…"
                      ? <span key={`e-${idx}`} className="px-2 text-[var(--muted)] text-sm">…</span>
                      : <button key={p} onClick={() => setPage(p as number)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--surface-2)]"}`}>
                          {p}
                        </button>
                    )}
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                    <Icon.ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Student detail drawer ── */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailRow(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-sm bg-[var(--surface)] h-full shadow-2xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <p className="font-semibold">Enrollment detail</p>
              <button onClick={() => setDetailRow(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition">
                <Icon.X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-5 flex-1">
              {/* Student info */}
              <div className="flex items-center gap-3">
                <Avatar name={detailRow.userName} src={null} size={48} />
                <div>
                  <p className="font-semibold">{detailRow.userName}</p>
                  <p className="text-xs text-[var(--muted)]">{detailRow.userEmail}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-2">
                  <Row label="Course" value={detailRow.courseTitle} />
                  <Row label="Enrolled" value={relativeTime(detailRow.enrolledAt)} />
                  <Row label="Status" value={statusLabel(detailRow)} />
                  <Row label="Certificate" value={detailRow.certificateId ? "Yes — " + detailRow.certificateId.slice(0, 8) + "…" : "Not issued"} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">Progress</span>
                    <span className="font-semibold tabular-nums">{detailRow.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full" style={{ width: `${detailRow.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {detailRow.certificateId ? (
                  <Button className="w-full" variant="ghost" onClick={() => { setRevokeRow(detailRow); setDetailRow(null); }}>
                    <Icon.Trash size={15} /> Revoke certificate
                  </Button>
                ) : (
                  <Button className="w-full" disabled={!detailRow.completed}
                    onClick={() => { setScore("90"); setAwardRow(detailRow); setDetailRow(null); }}
                    title={detailRow.completed ? "Award certificate" : "Complete course first"}
                  >
                    <Icon.Award size={15} /> Award certificate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award modal */}
      <Modal open={awardRow !== null} onClose={() => setAwardRow(null)} title="Award certificate" size="sm">
        {awardRow && (
          <div className="p-5 space-y-4">
            <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-1 text-sm">
              <p><span className="text-[var(--muted)]">Student:</span> <span className="font-medium">{awardRow.userName}</span></p>
              <p><span className="text-[var(--muted)]">Course:</span> <span className="font-medium">{awardRow.courseTitle}</span></p>
              <p><span className="text-[var(--muted)]">Progress:</span> <span className="font-medium">{awardRow.progress}%</span></p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="score" className="text-sm font-medium">Score (0–100)</label>
                <span className={`text-xs font-semibold ${Number(score) >= 60 ? "text-emerald-600" : "text-red-500"}`}>{score}%</span>
              </div>
              <Input id="score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
              <ScoreBar value={Number(score)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setAwardRow(null)}>Cancel</Button>
              <Button onClick={handleAward}><Icon.Award size={16} /> Award</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk award modal */}
      <Modal open={bulkAction === "award"} onClose={() => setBulkAction(null)} title="Bulk award certificates" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Award certificates to <strong className="text-[var(--foreground)]">
              {selectedRows.filter((r) => r.completed && !r.certificateId).length} student{selectedRows.filter((r) => r.completed && !r.certificateId).length !== 1 ? "s" : ""}
            </strong> who completed their course.
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Score for all (0–100)</label>
              <span className={`text-xs font-semibold ${Number(bulkScore) >= 60 ? "text-emerald-600" : "text-red-500"}`}>{bulkScore}%</span>
            </div>
            <Input type="number" min="0" max="100" value={bulkScore} onChange={(e) => setBulkScore(e.target.value)} />
            <ScoreBar value={Number(bulkScore)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setBulkAction(null)}>Cancel</Button>
            <Button onClick={handleBulkAward}><Icon.Award size={16} /> Award all</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk revoke modal */}
      <Modal open={bulkAction === "revoke"} onClose={() => setBulkAction(null)} title="Revoke certificates?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            This will revoke <strong className="text-[var(--foreground)]">
              {selectedRows.filter((r) => !!r.certificateId).length} certificate{selectedRows.filter((r) => !!r.certificateId).length !== 1 ? "s" : ""}
            </strong>. Students can be re-awarded later.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkAction(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkRevoke}><Icon.Trash size={16} /> Revoke all</Button>
          </div>
        </div>
      </Modal>

      {/* Single revoke modal */}
      <Modal open={revokeRow !== null} onClose={() => setRevokeRow(null)} title="Revoke certificate?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            This deletes the certificate from <strong className="text-[var(--foreground)]">{revokeRow?.userName}</strong>&apos;s record.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRevokeRow(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRevoke}><Icon.Trash size={16} /> Revoke</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[var(--muted)] shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}
