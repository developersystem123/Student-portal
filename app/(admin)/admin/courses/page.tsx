"use client";

import * as React from "react";
import Icon from "@/components/icons";
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
  Textarea,
  useToast,
} from "@/components/ui";
import { MediaCard } from "@/components/MediaCard";
import { useAdmin, useData } from "@/lib/store";
import type { Course, CourseCategory, CourseLevel } from "@/lib/mockData";

const CATEGORIES: CourseCategory[] = ["Web Dev", "Data Science", "Design", "Business", "Languages", "Math"];
const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];
const PAGE_SIZE = 9;

const defaultThumb = (a = "#16a34a", b = "#4ade80") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='600' height='400' fill='url(%23g)'/></svg>`,
  )}`;

type FormState = {
  title: string; description: string; instructor: string;
  category: CourseCategory; level: CourseLevel;
  price: string; durationMinutes: string; tags: string;
};
const emptyForm: FormState = {
  title: "", description: "", instructor: "",
  category: "Web Dev", level: "Beginner", price: "0", durationMinutes: "60", tags: "",
};

type SortKey = "title" | "price-asc" | "price-desc" | "chapters" | "duration";
type PriceFilter = "all" | "free" | "paid";

export default function AdminCoursesPage() {
  const { courses } = useData();
  const admin = useAdmin();
  const toast = useToast();

  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [priceFilter, setPriceFilter] = React.useState<PriceFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("title");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [page, setPage] = React.useState(1);
  const [mode, setMode] = React.useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [detailCourse, setDetailCourse] = React.useState<Course | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const stats = React.useMemo(() => {
    const free = courses.filter((c) => c.price === 0).length;
    const paidList = courses.filter((c) => c.price > 0);
    const avgPrice = paidList.length ? Math.round(paidList.reduce((s, c) => s + c.price, 0) / paidList.length) : 0;
    return { total: courses.length, free, paid: paidList.length, avgPrice };
  }, [courses]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = courses
      .filter((c) => categoryFilter === "all" || c.category === categoryFilter)
      .filter((c) => levelFilter === "all" || c.level === levelFilter)
      .filter((c) => priceFilter === "all" ? true : priceFilter === "free" ? c.price === 0 : c.price > 0)
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)));
    return [...base].sort((a, b) => {
      if (sortKey === "price-asc") return a.price - b.price;
      if (sortKey === "price-desc") return b.price - a.price;
      if (sortKey === "chapters") return b.chapters.length - a.chapters.length;
      if (sortKey === "duration") return b.durationMinutes - a.durationMinutes;
      return a.title.localeCompare(b.title);
    });
  }, [courses, query, categoryFilter, levelFilter, priceFilter, sortKey]);

  const activeFilters = (categoryFilter !== "all" ? 1 : 0) + (levelFilter !== "all" ? 1 : 0) + (priceFilter !== "all" ? 1 : 0) + (query ? 1 : 0);

  function clearFilters() { setQuery(""); setCategoryFilter("all"); setLevelFilter("all"); setPriceFilter("all"); setSortKey("title"); setPage(1); }
  React.useEffect(() => { setPage(1); setSelected(new Set()); }, [query, categoryFilter, levelFilter, priceFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));
  const somePageSelected = paginated.some((c) => selected.has(c.id));
  function toggleSelect(id: string) { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function togglePage() { setSelected((prev) => { const next = new Set(prev); if (allPageSelected) paginated.forEach((c) => next.delete(c.id)); else paginated.forEach((c) => next.add(c.id)); return next; }); }
  function handleBulkDelete() { Array.from(selected).forEach((id) => admin.deleteCourse(id)); toast.push({ title: `${selected.size} course${selected.size !== 1 ? "s" : ""} deleted`, tone: "info" }); setSelected(new Set()); setBulkDeleteOpen(false); }

  function exportCsv() {
    const header = "Title,Instructor,Category,Level,Price,Chapters,Duration (min)\n";
    const csv = filtered.map((c) => [`"${c.title}"`, `"${c.instructor}"`, c.category, c.level, c.price, c.chapters.length, c.durationMinutes].join(",")).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `courses-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  function startCreate() { setEditing(null); setMode("create"); }
  function startEdit(c: Course) { setEditing(c); setMode("edit"); }
  function handleDelete(id: string) { admin.deleteCourse(id); setConfirmDeleteId(null); toast.push({ title: "Course deleted", tone: "success" }); }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-[var(--muted)]">Add, edit, and remove courses from the catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}><Icon.Download size={16} /> Export CSV</Button>
          <Button onClick={startCreate}><Icon.Plus size={16} /> New course</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total courses", value: stats.total, icon: <Icon.Book size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
          { label: "Free", value: stats.free, icon: <Icon.Sparkles size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Paid", value: stats.paid, icon: <Icon.DollarSign size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Avg price (paid)", value: stats.avgPrice ? `$${stats.avgPrice}` : "—", icon: <Icon.TrendingUp size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
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
          {/* Toolbar row 1 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input icon={<Icon.Search size={16} />} placeholder="Search by title, instructor, category or tag…" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 sm:max-w-sm" />
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-80 transition whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Icon.X size={11} /> Clear ({activeFilters})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                <option value="title">Title A–Z</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
                <option value="chapters">Most chapters</option>
                <option value="duration">Longest</option>
              </Select>
              <div className="flex rounded-xl border border-[var(--border)] overflow-hidden shrink-0">
                <button onClick={() => setViewMode("grid")} className={`h-10 w-10 flex items-center justify-center transition ${viewMode === "grid" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`} title="Grid view"><Icon.LayoutGrid size={15} /></button>
                <button onClick={() => setViewMode("list")} className={`h-10 w-10 flex items-center justify-center transition ${viewMode === "list" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`} title="List view"><Icon.LayoutList size={15} /></button>
              </div>
            </div>
          </div>

          {/* Filter pills row 2 */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-[var(--muted)] mr-1">Category:</span>
            {["all", ...CATEGORIES].map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 h-7 rounded-lg text-xs font-medium transition ${categoryFilter === cat ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{cat === "all" ? "All" : cat}</button>
            ))}
            <span className="text-xs text-[var(--muted)] ml-3 mr-1">Level:</span>
            {["all", ...LEVELS].map((lvl) => (
              <button key={lvl} onClick={() => setLevelFilter(lvl)} className={`px-3 h-7 rounded-lg text-xs font-medium transition ${levelFilter === lvl ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{lvl === "all" ? "All levels" : lvl}</button>
            ))}
            <span className="text-xs text-[var(--muted)] ml-3 mr-1">Price:</span>
            {(["all", "free", "paid"] as PriceFilter[]).map((p) => (
              <button key={p} onClick={() => setPriceFilter(p)} className={`px-3 h-7 rounded-lg text-xs font-medium capitalize transition ${priceFilter === p ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{p === "all" ? "All prices" : p}</button>
            ))}
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/20 flex-wrap">
              <span className="text-sm font-medium text-[var(--primary)]">{selected.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="ghost" onClick={() => setBulkDeleteOpen(true)}><Icon.Trash size={14} /> Delete selected</Button>
                <button onClick={() => setSelected(new Set())} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition">Clear</button>
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-xs text-[var(--muted)]">{filtered.length === courses.length ? `${courses.length} course${courses.length !== 1 ? "s" : ""}` : `${filtered.length} of ${courses.length} courses`}</p>
          )}

          {filtered.length === 0 ? (
            <EmptyState icon={<Icon.Book size={20} />} title={activeFilters > 0 ? "No courses match." : "No courses yet."} description={activeFilters > 0 ? "Try clearing filters." : "Create your first course."} action={activeFilters === 0 ? <Button onClick={startCreate}><Icon.Plus size={16} /> New course</Button> : undefined} />
          ) : viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((c) => (
                <div key={c.id} className="group relative flex flex-col">
                  <div className="absolute top-2 left-2 z-10">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 accent-[var(--primary)] cursor-pointer rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: selected.has(c.id) ? 1 : undefined }} />
                  </div>
                  <MediaCard image={c.thumbnail} imageAlt={c.title} fallbackIcon={<Icon.Book size={30} />} bodyClassName="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{c.category}</Badge>
                      <Badge variant="default">{c.level}</Badge>
                      {c.price === 0 ? <Badge variant="success">Free</Badge> : <Badge variant="info">${c.price}</Badge>}
                    </div>
                    <h3 className="font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-[var(--primary)] transition" onClick={() => setDetailCourse(c)}>{c.title}</h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-2">{c.description}</p>
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                      <span className="flex items-center gap-1"><Icon.User size={11} />{c.instructor}</span>
                      <span className="flex items-center gap-1"><Icon.Book size={11} />{c.chapters.length} chapters</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(c)}><Icon.FilePen size={14} /> Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDetailCourse(c)} title="Details"><Icon.Eye size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(c.id)} title="Delete"><Icon.Trash size={14} /></Button>
                    </div>
                  </MediaCard>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 w-10"><input type="checkbox" checked={allPageSelected} ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }} onChange={togglePage} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" /></th>
                    <th className="py-2.5 px-3 font-medium">Course</th>
                    <th className="py-2.5 px-3 font-medium hidden md:table-cell">Instructor</th>
                    <th className="py-2.5 px-3 font-medium">Category</th>
                    <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Level</th>
                    <th className="py-2.5 px-3 font-medium text-center">Chapters</th>
                    <th className="py-2.5 px-3 font-medium text-center hidden sm:table-cell">Duration</th>
                    <th className="py-2.5 px-3 font-medium text-center">Price</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 transition ${selected.has(c.id) ? "bg-[var(--primary-soft)]/30" : ""}`}>
                      <td className="py-3 px-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" /></td>
                      <td className="py-3 px-3 min-w-[160px]">
                        <button className="font-medium text-left hover:text-[var(--primary)] transition line-clamp-1" onClick={() => setDetailCourse(c)}>{c.title}</button>
                        <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">{c.description}</p>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-[var(--muted)] text-xs">{c.instructor}</td>
                      <td className="py-3 px-3"><Badge variant="primary">{c.category}</Badge></td>
                      <td className="py-3 px-3 hidden sm:table-cell"><Badge variant="default">{c.level}</Badge></td>
                      <td className="py-3 px-3 text-center text-[var(--muted)]">{c.chapters.length}</td>
                      <td className="py-3 px-3 text-center text-[var(--muted)] hidden sm:table-cell text-xs">{Math.round(c.durationMinutes / 60 * 10) / 10}h</td>
                      <td className="py-3 px-3 text-center">{c.price === 0 ? <Badge variant="success">Free</Badge> : <Badge variant="info">${c.price}</Badge>}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => setDetailCourse(c)} title="Details"><Icon.Eye size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(c)} title="Edit"><Icon.FilePen size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(c.id)} title="Delete"><Icon.Trash size={14} /></Button>
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
              <p className="text-sm text-[var(--muted)]">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}><Icon.ChevronLeft size={16} /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1).reduce<(number | "…")[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(p); return acc; }, []).map((p, idx) => p === "…" ? <span key={`e-${idx}`} className="px-2 text-[var(--muted)] text-sm">…</span> : <button key={p} onClick={() => setPage(p as number)} className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--surface-2)]"}`}>{p}</button>)}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><Icon.ChevronRight size={16} /></Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detail drawer */}
      {detailCourse && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailCourse(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-sm bg-[var(--surface)] h-full shadow-2xl flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <p className="font-semibold">Course details</p>
              <button onClick={() => setDetailCourse(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition"><Icon.X size={16} /></button>
            </div>
            <div className="aspect-video shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailCourse.thumbnail} alt={detailCourse.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">{detailCourse.category}</Badge>
                <Badge variant="default">{detailCourse.level}</Badge>
                {detailCourse.price === 0 ? <Badge variant="success">Free</Badge> : <Badge variant="info">${detailCourse.price}</Badge>}
              </div>
              <h2 className="text-lg font-bold leading-snug">{detailCourse.title}</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{detailCourse.description}</p>
              <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-2 text-sm">
                <DRow label="Instructor" value={detailCourse.instructor} />
                <DRow label="Chapters" value={String(detailCourse.chapters.length)} />
                <DRow label="Duration" value={`${Math.round(detailCourse.durationMinutes / 60 * 10) / 10}h`} />
                <DRow label="Price" value={detailCourse.price === 0 ? "Free" : `$${detailCourse.price}`} />
              </div>
              {detailCourse.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailCourse.tags.map((tag) => <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">{tag}</span>)}
                </div>
              )}
              {detailCourse.chapters.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Chapters</p>
                  <ol className="space-y-1">
                    {detailCourse.chapters.map((ch, i) => (
                      <li key={ch.id} className="flex items-start gap-2 text-sm">
                        <span className="h-5 w-5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span>{ch.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Button className="w-full" onClick={() => { startEdit(detailCourse); setDetailCourse(null); }}><Icon.FilePen size={15} /> Edit course</Button>
                <Button className="w-full" variant="ghost" onClick={() => { setConfirmDeleteId(detailCourse.id); setDetailCourse(null); }}><Icon.Trash size={15} /> Delete course</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CourseFormModal open={mode !== null} mode={mode} course={editing} onClose={() => setMode(null)} />

      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Delete course?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">This removes the course from the catalog and clears any enrollments / certificates that reference it.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}><Icon.Trash size={15} /> Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title={`Delete ${selected.size} course${selected.size !== 1 ? "s" : ""}?`} size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">Permanently deletes <strong className="text-[var(--foreground)]">{selected.size} course{selected.size !== 1 ? "s" : ""}</strong> and their enrollments.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkDelete}><Icon.Trash size={15} /> Delete all</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[var(--muted)] shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function CourseFormModal({ open, mode, course, onClose }: { open: boolean; mode: "create" | "edit" | null; course: Course | null; onClose: () => void; }) {
  const admin = useAdmin();
  const toast = useToast();
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && course) {
      setForm({ title: course.title, description: course.description, instructor: course.instructor, category: course.category, level: course.level, price: String(course.price), durationMinutes: String(course.durationMinutes), tags: course.tags.join(", ") });
    } else { setForm(emptyForm); }
    setErr(null);
  }, [open, mode, course]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) { setForm((f) => ({ ...f, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    if (form.title.trim().length < 3) return setErr("Title is too short.");
    if (form.description.trim().length < 10) return setErr("Description should be at least 10 characters.");
    if (form.instructor.trim().length < 2) return setErr("Instructor name is required.");
    const price = Number(form.price); const duration = Number(form.durationMinutes);
    if (!Number.isFinite(price) || price < 0) return setErr("Price must be 0 or a positive number.");
    if (!Number.isFinite(duration) || duration <= 0) return setErr("Duration must be a positive number of minutes.");
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { title: form.title.trim(), description: form.description.trim(), instructor: form.instructor.trim(), category: form.category, level: form.level, price, durationMinutes: duration, tags, thumbnail: course?.thumbnail ?? defaultThumb() };
    if (mode === "edit" && course) { admin.updateCourse(course.id, payload); toast.push({ title: "Course updated", tone: "success" }); }
    else { admin.addCourse(payload); toast.push({ title: "Course added", tone: "success" }); }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "edit" ? "Edit course" : "New course"} size="lg">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="c-title">Title</Label><Input id="c-title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Intro to Python" /></div>
        <div><Label htmlFor="c-desc">Description</Label><Textarea id="c-desc" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What will students learn?" rows={4} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label htmlFor="c-instr">Instructor</Label><Input id="c-instr" value={form.instructor} onChange={(e) => update("instructor", e.target.value)} /></div>
          <div><Label htmlFor="c-tags">Tags (comma-separated)</Label><Input id="c-tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="React, TypeScript" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><Label htmlFor="c-cat">Category</Label><Select id="c-cat" value={form.category} onChange={(e) => update("category", e.target.value as CourseCategory)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
          <div><Label htmlFor="c-lvl">Level</Label><Select id="c-lvl" value={form.level} onChange={(e) => update("level", e.target.value as CourseLevel)}>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</Select></div>
          <div><Label htmlFor="c-price">Price (USD)</Label><Input id="c-price" type="number" min="0" step="1" value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
          <div><Label htmlFor="c-dur">Duration (min)</Label><Input id="c-dur" type="number" min="1" step="1" value={form.durationMinutes} onChange={(e) => update("durationMinutes", e.target.value)} /></div>
        </div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{mode === "edit" ? "Save changes" : "Create course"}</Button>
        </div>
      </form>
    </Modal>
  );
}
