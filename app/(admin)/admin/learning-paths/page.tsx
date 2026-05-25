"use client";

import * as React from "react";
import Icon from "@/components/icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { useData } from "@/lib/store";
import type { CourseCategory, CourseLevel } from "@/lib/mockData";

const CATEGORIES: CourseCategory[] = ["Web Dev", "Data Science", "Design", "Business", "Languages", "Math"];
const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];
const PAGE_SIZE = 9;

type SortOpt = "default" | "oldest" | "az" | "za" | "learners-desc" | "learners-asc" | "courses-desc";

type AdminPath = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: CourseCategory;
  level: CourseLevel;
  featured: boolean;
  learners: number;
  courseIds: string[];
  courseTitles: string[];
};

export default function AdminLearningPathsPage() {
  const toast = useToast();
  const [paths, setPaths] = React.useState<AdminPath[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = React.useState(false);
  const [sortOpt, setSortOpt] = React.useState<SortOpt>("default");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [mode, setMode] = React.useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<AdminPath | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [detailPath, setDetailPath] = React.useState<AdminPath | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [busyFeatureId, setBusyFeatureId] = React.useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/learning-paths");
    const data = await r.json().catch(() => ({}));
    setPaths(data.paths ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const pathStats = React.useMemo(() => ({
    total: paths.length,
    featured: paths.filter((p) => p.featured).length,
    totalLearners: paths.reduce((s, p) => s + p.learners, 0),
    avgCourses: paths.length
      ? Math.round(paths.reduce((s, p) => s + p.courseIds.length, 0) / paths.length)
      : 0,
  }), [paths]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = paths.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (levelFilter !== "all" && p.level !== levelFilter) return false;
      if (featuredOnly && !p.featured) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...base];
    if (sortOpt === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOpt === "za") sorted.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortOpt === "learners-desc") sorted.sort((a, b) => b.learners - a.learners);
    else if (sortOpt === "learners-asc") sorted.sort((a, b) => a.learners - b.learners);
    else if (sortOpt === "courses-desc") sorted.sort((a, b) => b.courseIds.length - a.courseIds.length);
    else if (sortOpt === "oldest") sorted.reverse();
    return sorted;
  }, [paths, query, categoryFilter, levelFilter, featuredOnly, sortOpt]);

  const activeFilters =
    (categoryFilter !== "all" ? 1 : 0) +
    (levelFilter !== "all" ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (query ? 1 : 0);

  function clearFilters() {
    setQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setFeaturedOnly(false);
    setSortOpt("default");
    setPage(1);
  }

  React.useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [query, categoryFilter, levelFilter, featuredOnly, sortOpt]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete(id: string) {
    const r = await fetch(`/api/admin/learning-paths/${encodeURIComponent(id)}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    if (r.ok) {
      toast.push({ title: "Learning path deleted", tone: "success" });
      load();
    } else {
      toast.push({ title: "Couldn't delete path", tone: "danger" });
    }
  }

  async function toggleFeatured(p: AdminPath) {
    setBusyFeatureId(p.id);
    const r = await fetch(`/api/admin/learning-paths/${encodeURIComponent(p.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    });
    setBusyFeatureId(null);
    if (r.ok) {
      setPaths((prev) => prev.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x));
      if (detailPath?.id === p.id) setDetailPath((prev) => prev ? { ...prev, featured: !p.featured } : null);
      toast.push({ title: p.featured ? "Removed from featured" : "Marked as featured", tone: "success" });
    } else {
      toast.push({ title: "Couldn't update", tone: "danger" });
    }
  }

  async function duplicatePath(p: AdminPath) {
    setDuplicatingId(p.id);
    const r = await fetch("/api/admin/learning-paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${p.title} (copy)`,
        description: p.description,
        category: p.category,
        level: p.level,
        featured: false,
        courseIds: p.courseIds,
      }),
    });
    setDuplicatingId(null);
    if (r.ok) {
      toast.push({ title: "Path duplicated", tone: "success" });
      load();
    } else {
      toast.push({ title: "Couldn't duplicate", tone: "danger" });
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    await Promise.all(
      ids.map((id) => fetch(`/api/admin/learning-paths/${encodeURIComponent(id)}`, { method: "DELETE" })),
    );
    toast.push({ title: `${ids.length} path${ids.length !== 1 ? "s" : ""} deleted`, tone: "info" });
    setSelected(new Set());
    setBulkDeleteOpen(false);
    load();
  }

  async function handleBulkFeature(featured: boolean) {
    const ids = Array.from(selected);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/learning-paths/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured }),
        }),
      ),
    );
    setPaths((prev) => prev.map((p) => selected.has(p.id) ? { ...p, featured } : p));
    setSelected(new Set());
    toast.push({ title: `${ids.length} path${ids.length !== 1 ? "s" : ""} ${featured ? "featured" : "unfeatured"}`, tone: "success" });
  }

  function exportCsv() {
    const header = "Title,Category,Level,Courses,Learners,Featured\n";
    const csv = filtered
      .map((p) =>
        [`"${p.title}"`, p.category, p.level, p.courseIds.length, p.learners, p.featured ? "Yes" : "No"].join(","),
      )
      .join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-paths-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allPageSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id));
  const somePageSelected = paginated.some((p) => selected.has(p.id));

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach((p) => next.delete(p.id));
      else paginated.forEach((p) => next.add(p.id));
      return next;
    });
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Learning Paths</h1>
          <p className="mt-1 text-[var(--muted)]">Curate ordered tracks of courses for students to follow.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Icon.Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => { setEditing(null); setMode("create"); }}>
            <Icon.Plus size={16} /> New path
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total paths", value: pathStats.total, icon: <Icon.Route size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
          { label: "Featured", value: pathStats.featured, icon: <Icon.Star size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { label: "Total learners", value: pathStats.totalLearners, icon: <Icon.Users size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Avg courses / path", value: pathStats.avgCourses, icon: <Icon.Book size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3 !py-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>{s.icon}</div>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--muted)]">{s.label}</p>
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3">
            {/* Row 1: search + sort + view toggle */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  icon={<Icon.Search size={16} />}
                  placeholder="Search by title, description or category…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 sm:max-w-sm"
                />
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-80 transition whitespace-nowrap flex items-center gap-1 shrink-0"
                  >
                    <Icon.X size={11} /> Clear ({activeFilters})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={sortOpt}
                  onChange={(e) => setSortOpt(e.target.value as SortOpt)}
                >
                  <option value="default">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  <option value="learners-desc">Most learners</option>
                  <option value="learners-asc">Fewest learners</option>
                  <option value="courses-desc">Most courses</option>
                </Select>
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`h-10 w-10 flex items-center justify-center transition ${viewMode === "grid" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
                    title="Grid view"
                  >
                    <Icon.LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`h-10 w-10 flex items-center justify-center transition ${viewMode === "list" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
                    title="List view"
                  >
                    <Icon.LayoutList size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: category + level + featured filters */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-[var(--muted)] mr-1">Category:</span>
              {["all", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 h-7 rounded-lg text-xs font-medium transition ${categoryFilter === cat ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
              <span className="text-xs text-[var(--muted)] ml-3 mr-1">Level:</span>
              {["all", ...LEVELS].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 h-7 rounded-lg text-xs font-medium transition ${levelFilter === lvl ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  {lvl === "all" ? "All levels" : lvl}
                </button>
              ))}
              <button
                onClick={() => setFeaturedOnly((v) => !v)}
                className={`ml-2 px-3 h-7 rounded-lg text-xs font-medium transition flex items-center gap-1 ${featuredOnly ? "bg-amber-500 text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                <Icon.Star size={11} /> Featured only
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/20 flex-wrap">
              <span className="text-sm font-medium text-[var(--primary)]">{selected.size} selected</span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <Button size="sm" variant="soft" onClick={() => handleBulkFeature(true)}>
                  <Icon.Star size={14} /> Feature all
                </Button>
                <Button size="sm" variant="soft" onClick={() => handleBulkFeature(false)}>
                  <Icon.Star size={14} /> Unfeature all
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setBulkDeleteOpen(true)}>
                  <Icon.Trash size={14} /> Delete
                </Button>
                <button onClick={() => setSelected(new Set())} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-xs text-[var(--muted)]">
              {filtered.length === paths.length
                ? `${paths.length} path${paths.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${paths.length} paths`}
            </p>
          )}

          {/* Content */}
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-[var(--muted)]">
              <Icon.Loader size={18} /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Icon.Route size={20} />}
              title={activeFilters > 0 ? "No paths match." : "No learning paths yet."}
              description={activeFilters > 0 ? "Try clearing filters." : "Create your first learning path."}
            />
          ) : viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((p) => (
                <div key={p.id} className="group relative flex flex-col">
                  {/* Bulk checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="h-4 w-4 accent-[var(--primary)] cursor-pointer rounded transition-opacity"
                      style={{ opacity: selected.has(p.id) ? 1 : undefined }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <Card className="overflow-hidden flex flex-col h-full">
                    {/* Thumbnail */}
                    <div
                      className="aspect-video cursor-pointer relative overflow-hidden shrink-0"
                      onClick={() => setDetailPath(p)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Inline featured star */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFeatured(p); }}
                        disabled={busyFeatureId === p.id}
                        className={`absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-md ${p.featured ? "bg-amber-500 text-white" : "bg-black/40 text-white/70 hover:bg-amber-500 hover:text-white"}`}
                        title={p.featured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Icon.Star size={14} />
                      </button>
                    </div>
                    <CardBody className="flex-1 flex flex-col space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary">{p.category}</Badge>
                        <Badge variant="default">{p.level}</Badge>
                        {p.featured && <Badge variant="warning"><Icon.Star size={11} /> Featured</Badge>}
                      </div>
                      <h3
                        className="font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-[var(--primary)] transition"
                        onClick={() => setDetailPath(p)}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] line-clamp-2 flex-1">{p.description}</p>
                      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Icon.Book size={12} /> {p.courseIds.length} course{p.courseIds.length !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon.Users size={12} /> {p.learners} learner{p.learners !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => { setEditing(p); setMode("edit"); }}
                        >
                          <Icon.FilePen size={14} /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicatePath(p)}
                          disabled={duplicatingId === p.id}
                          title="Duplicate"
                        >
                          <Icon.Copy size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(p.id)} title="Delete">
                          <Icon.Trash size={14} />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            /* List / table view */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                        onChange={togglePage}
                        className="h-4 w-4 accent-[var(--primary)] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3 font-medium">Title</th>
                    <th className="py-2.5 px-3 font-medium">Category</th>
                    <th className="py-2.5 px-3 font-medium">Level</th>
                    <th className="py-2.5 px-3 font-medium text-center">Courses</th>
                    <th className="py-2.5 px-3 font-medium text-center">Learners</th>
                    <th className="py-2.5 px-3 font-medium text-center">Featured</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 transition ${selected.has(p.id) ? "bg-[var(--primary-soft)]/30" : ""}`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="h-4 w-4 accent-[var(--primary)] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 min-w-[180px]">
                        <button
                          className="text-left font-medium hover:text-[var(--primary)] transition line-clamp-1"
                          onClick={() => setDetailPath(p)}
                        >
                          {p.title}
                        </button>
                        <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">{p.description}</p>
                      </td>
                      <td className="py-3 px-3"><Badge variant="primary">{p.category}</Badge></td>
                      <td className="py-3 px-3"><Badge variant="default">{p.level}</Badge></td>
                      <td className="py-3 px-3 text-center text-[var(--muted)]">{p.courseIds.length}</td>
                      <td className="py-3 px-3 text-center text-[var(--muted)]">{p.learners}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleFeatured(p)}
                          disabled={busyFeatureId === p.id}
                          className={`transition ${p.featured ? "text-amber-500" : "text-[var(--muted-2)] hover:text-amber-400"}`}
                          title={p.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Icon.Star size={16} />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicatePath(p)}
                          disabled={duplicatingId === p.id}
                          title="Duplicate"
                        >
                          <Icon.Copy size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setMode("edit"); }} title="Edit">
                          <Icon.FilePen size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(p.id)} title="Delete">
                          <Icon.Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)] flex-wrap">
              <p className="text-sm text-[var(--muted)]">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
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
                      <span key={`e-${idx}`} className="px-2 text-[var(--muted)] text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--surface-2)]"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                  <Icon.ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detail side drawer */}
      {detailPath && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailPath(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-sm bg-[var(--surface)] h-full shadow-2xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <p className="font-semibold">Path details</p>
              <button
                onClick={() => setDetailPath(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition"
              >
                <Icon.X size={16} />
              </button>
            </div>
            <div className="aspect-video shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailPath.thumbnail} alt={detailPath.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">{detailPath.category}</Badge>
                <Badge variant="default">{detailPath.level}</Badge>
                {detailPath.featured && (
                  <Badge variant="warning"><Icon.Star size={11} /> Featured</Badge>
                )}
              </div>
              <h2 className="text-lg font-bold leading-snug">{detailPath.title}</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{detailPath.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold">{detailPath.courseIds.length}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Courses</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold">{detailPath.learners}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Learners</p>
                </div>
              </div>

              {detailPath.courseTitles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Courses in this path</p>
                  <ol className="space-y-1.5">
                    {detailPath.courseTitles.map((title, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="h-5 w-5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Button
                  className="w-full"
                  onClick={() => { setEditing(detailPath); setMode("edit"); setDetailPath(null); }}
                >
                  <Icon.FilePen size={15} /> Edit path
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toggleFeatured(detailPath)}
                  disabled={busyFeatureId === detailPath.id}
                >
                  <Icon.Star size={15} />
                  {detailPath.featured ? "Remove from featured" : "Mark as featured"}
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => { duplicatePath(detailPath); setDetailPath(null); }}
                >
                  <Icon.Copy size={15} /> Duplicate path
                </Button>
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => { setConfirmDeleteId(detailPath.id); setDetailPath(null); }}
                >
                  <Icon.Trash size={15} /> Delete path
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PathFormModal
        open={mode !== null}
        mode={mode}
        path={editing}
        onClose={() => setMode(null)}
        onSaved={() => { setMode(null); load(); }}
      />

      {/* Single delete confirm */}
      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Delete learning path?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            This removes the path and its student enrolments. The courses themselves are not affected.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
              <Icon.Trash size={15} /> Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk delete confirm */}
      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title={`Delete ${selected.size} path${selected.size !== 1 ? "s" : ""}?`}
        size="sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            This permanently deletes{" "}
            <strong className="text-[var(--foreground)]">
              {selected.size} learning path{selected.size !== 1 ? "s" : ""}
            </strong>{" "}
            and their student enrolments.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              <Icon.Trash size={15} /> Delete all
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PathFormModal ────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  featured: boolean;
  courseIds: string[];
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "Web Dev",
  level: "Beginner",
  featured: false,
  courseIds: [],
};

function PathFormModal({
  open,
  mode,
  path,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit" | null;
  path: AdminPath | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { courses } = useData();
  const toast = useToast();
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [courseQuery, setCourseQuery] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && path) {
      setForm({
        title: path.title,
        description: path.description,
        category: path.category,
        level: path.level,
        featured: path.featured,
        courseIds: path.courseIds,
      });
    } else {
      setForm(emptyForm);
    }
    setCourseQuery("");
    setErr(null);
  }, [open, mode, path]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleCourse(id: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((c) => c !== id)
        : [...f.courseIds, id],
    }));
  }

  const visibleCourses = React.useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    return courses.filter((c) => !q || c.title.toLowerCase().includes(q));
  }, [courses, courseQuery]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.title.trim().length < 3) return setErr("Title is too short.");
    if (form.description.trim().length < 10)
      return setErr("Description should be at least 10 characters.");
    if (form.courseIds.length === 0) return setErr("Add at least one course to the path.");

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      featured: form.featured,
      courseIds: form.courseIds,
    };
    const r =
      mode === "edit" && path
        ? await fetch(`/api/admin/learning-paths/${encodeURIComponent(path.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/learning-paths", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    const data = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      setErr(data.error ?? "Couldn't save the path.");
      return;
    }
    toast.push({ title: mode === "edit" ? "Path updated" : "Path created", tone: "success" });
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit learning path" : "New learning path"}
      size="lg"
    >
      <form onSubmit={submit} className="p-5 space-y-4">
        <div>
          <Label htmlFor="p-title">Title</Label>
          <Input
            id="p-title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Full-Stack Web Developer"
          />
        </div>
        <div>
          <Label htmlFor="p-desc">Description</Label>
          <Textarea
            id="p-desc"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What will students achieve by completing this path?"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="p-cat">Category</Label>
            <Select
              id="p-cat"
              value={form.category}
              onChange={(e) => update("category", e.target.value as CourseCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="p-lvl">Level</Label>
            <Select
              id="p-lvl"
              value={form.level}
              onChange={(e) => update("level", e.target.value as CourseLevel)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end pb-2.5">
            <Checkbox checked={form.featured} onChange={(v) => update("featured", v)} label="Featured" />
          </div>
        </div>

        <div>
          <Label>Courses in this path ({form.courseIds.length} selected)</Label>
          <p className="text-xs text-[var(--muted)] mb-2">
            Courses appear to students in the order you select them.
          </p>
          <Input
            icon={<Icon.Search size={16} />}
            placeholder="Search courses…"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-56 overflow-y-auto scrollbar-thin rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
            {visibleCourses.length === 0 ? (
              <p className="text-sm text-[var(--muted)] p-3">No courses match.</p>
            ) : (
              visibleCourses.map((c) => {
                const idx = form.courseIds.indexOf(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-[var(--surface-2)] transition"
                  >
                    <span
                      className={
                        "h-5 w-5 shrink-0 rounded-md border flex items-center justify-center text-[10px] font-bold " +
                        (idx >= 0
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                          : "border-[var(--border-strong)]")
                      }
                    >
                      {idx >= 0 ? idx + 1 : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{c.title}</span>
                      <span className="block text-xs text-[var(--muted)]">
                        {c.category} · {c.level}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {err && (
          <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {err}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>
            {mode === "edit" ? "Save changes" : "Create path"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
