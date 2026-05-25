"use client";

import * as React from "react";
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
import Icon from "@/components/icons";
import { relativeTime } from "@/lib/utils";

type Review = {
  id: string;
  courseId: string;
  rating: number;
  body: string;
  reply: string | null;
  repliedAt: string | null;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; avatar: string | null };
  course: { id: string; title: string } | null;
};

type Filter = "all" | "visible" | "hidden" | "low";
type SortKey = "newest" | "oldest" | "rating-high" | "rating-low";
type RatingFilter = "all" | "5" | "4" | "3" | "lte2";

const PAGE_SIZE = 10;

export default function AdminReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<Review | null>(null);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkBusy, setBulkBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/reviews", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) setReviews(data.reviews ?? []);
      else toast.push({ title: data.error ?? "Failed to load reviews.", tone: "danger" });
    } catch {
      toast.push({ title: "Failed to load reviews.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(
    () => ({
      all: reviews.length,
      visible: reviews.filter((r) => !r.hidden).length,
      hidden: reviews.filter((r) => r.hidden).length,
      low: reviews.filter((r) => r.rating <= 2).length,
    }),
    [reviews],
  );

  const avgRating = React.useMemo(() => {
    const visible = reviews.filter((r) => !r.hidden);
    if (visible.length === 0) return 0;
    return Math.round((visible.reduce((s, r) => s + r.rating, 0) / visible.length) * 10) / 10;
  }, [reviews]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = reviews.filter((r) => {
      if (filter === "visible" && r.hidden) return false;
      if (filter === "hidden" && !r.hidden) return false;
      if (filter === "low" && r.rating > 2) return false;
      if (ratingFilter === "5" && r.rating !== 5) return false;
      if (ratingFilter === "4" && r.rating !== 4) return false;
      if (ratingFilter === "3" && r.rating !== 3) return false;
      if (ratingFilter === "lte2" && r.rating > 2) return false;
      if (!q) return true;
      return (
        r.author.name.toLowerCase().includes(q) ||
        (r.course?.title ?? "").toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "rating-high") return b.rating - a.rating;
      if (sortKey === "rating-low") return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [reviews, filter, query, sortKey, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [filter, query, sortKey, ratingFilter]);

  const activeFilters = React.useMemo(() => {
    let n = 0;
    if (query.trim()) n++;
    if (filter !== "all") n++;
    if (ratingFilter !== "all") n++;
    return n;
  }, [query, filter, ratingFilter]);

  function clearFilters() {
    setQuery("");
    setFilter("all");
    setRatingFilter("all");
    setSortKey("newest");
    setPage(1);
  }

  // Bulk select helpers
  const pageIds = paginated.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id)) && !allPageSelected;

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleHidden(review: Review) {
    setBusyId(review.id);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ hidden: !review.hidden }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ title: data.error ?? "Update failed.", tone: "danger" });
        return;
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, hidden: !review.hidden } : r)),
      );
      toast.push({
        title: review.hidden ? "Review is now visible" : "Review hidden",
        tone: "success",
      });
    } catch {
      toast.push({ title: "Update failed.", tone: "danger" });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      const res = await fetch(`/api/reviews/${deleting.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.push({ title: data.error ?? "Delete failed.", tone: "danger" });
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== deleting.id));
      toast.push({ title: "Review deleted", tone: "success" });
      setDeleting(null);
    } catch {
      toast.push({ title: "Delete failed.", tone: "danger" });
    } finally {
      setBusyId(null);
    }
  }

  async function bulkHide() {
    setBulkBusy(true);
    const ids = Array.from(selected);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/reviews/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ hidden: true }),
        }),
      ),
    );
    setReviews((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, hidden: true } : r)));
    toast.push({ title: `${ids.length} review(s) hidden`, tone: "success" });
    setSelected(new Set());
    setBulkBusy(false);
  }

  async function bulkDelete() {
    setBulkBusy(true);
    const ids = Array.from(selected);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "same-origin" }),
      ),
    );
    setReviews((prev) => prev.filter((r) => !selected.has(r.id)));
    toast.push({ title: `${ids.length} review(s) deleted`, tone: "success" });
    setSelected(new Set());
    setBulkDeleteOpen(false);
    setBulkBusy(false);
  }

  function exportCsv() {
    const header = ["Reviewer", "Course", "Rating", "Hidden", "Date", "Body"];
    const rows = filtered.map((r) => [
      r.author.name,
      r.course?.title ?? "",
      String(r.rating),
      r.hidden ? "Yes" : "No",
      r.createdAt,
      r.body.replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "CSV exported", tone: "success" });
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "rating-high", label: "Rating ↑" },
    { key: "rating-low", label: "Rating ↓" },
  ];

  const RATING_OPTIONS: { key: RatingFilter; label: string }[] = [
    { key: "all", label: "All ratings" },
    { key: "5", label: "5★" },
    { key: "4", label: "4★" },
    { key: "3", label: "3★" },
    { key: "lte2", label: "≤2★" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Reviews moderation</h1>
          <p className="mt-1 text-muted">
            Browse every course review and hide anything inappropriate. Hidden reviews stop counting
            toward a course&apos;s public rating.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Icon.Download size={15} /> Export CSV
        </Button>
      </div>

      {/* Stat cards — always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total reviews", value: counts.all, icon: <Icon.MessageSquare size={16} />, tint: "bg-primary-soft text-primary" },
          { label: "Avg rating", value: avgRating || "—", icon: <Icon.Star size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { label: "Hidden", value: counts.hidden, icon: <Icon.EyeOff size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Low-rated (≤2★)", value: counts.low, icon: <Icon.AlertCircle size={16} />, tint: "bg-rose-500/10 text-rose-500" },
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

      {/* Tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Tabs
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "visible", label: "Visible", count: counts.visible },
            { value: "hidden", label: "Hidden", count: counts.hidden },
            { value: "low", label: "Low-rated", count: counts.low },
          ]}
        />
        <div className="md:w-80">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reviewer, course, or text…"
            icon={<Icon.Search size={16} />}
          />
        </div>
      </div>

      {/* Sort + Rating filter pills */}
      <div className="flex flex-wrap items-center gap-2">
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
        <span className="text-xs text-muted font-medium ml-3 mr-1">Rating:</span>
        {RATING_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setRatingFilter(o.key)}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition ${ratingFilter === o.key ? "bg-[var(--primary)] text-white" : "border border-border text-muted hover:bg-surface-2"}`}
          >
            {o.label}
          </button>
        ))}
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs px-2.5 py-1.5 rounded-lg text-primary bg-primary-soft hover:opacity-80 transition flex items-center gap-1"
          >
            <Icon.X size={11} /> Clear ({activeFilters})
          </button>
        )}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-2 border border-border">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={bulkHide} loading={bulkBusy}>
              <Icon.EyeOff size={14} /> Hide all
            </Button>
            <Button size="sm" variant="danger" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}>
              <Icon.Trash size={14} /> Delete all
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-12 text-muted">
              <Icon.Loader size={18} /> Loading reviews…
            </div>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.MessageSquare size={28} />}
              title="No reviews"
              description={
                reviews.length === 0
                  ? "No course reviews have been submitted yet."
                  : "No reviews match the current filter."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Row count + header checkbox */}
          <div className="flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allPageSelected}
                ref={(el) => { if (el) el.indeterminate = somePageSelected; }}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-[var(--primary)]"
              />
              <span className="text-sm text-muted">Select page</span>
            </label>
            <span className="text-sm text-muted ml-auto">
              {filtered.length} review{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {paginated.map((r) => (
            <Card key={r.id} className={r.hidden ? "opacity-70" : ""}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 rounded accent-[var(--primary)]"
                    />
                  </div>
                  <Avatar src={r.author.avatar} name={r.author.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{r.author.name}</span>
                      <Stars rating={r.rating} />
                      {r.hidden && <Badge variant="danger">Hidden</Badge>}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {r.course?.title ?? "Unknown course"} · {relativeTime(r.createdAt)}
                    </p>
                    <p className="text-sm mt-2 whitespace-pre-wrap break-words">{r.body}</p>
                    {r.reply && (
                      <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold mb-1">
                          Staff reply
                        </p>
                        <p className="whitespace-pre-wrap break-words">{r.reply}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant={r.hidden ? "soft" : "outline"}
                      onClick={() => toggleHidden(r)}
                      loading={busyId === r.id}
                    >
                      {r.hidden ? (
                        <>
                          <Icon.Eye size={14} /> Unhide
                        </>
                      ) : (
                        <>
                          <Icon.EyeOff size={14} /> Hide
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleting(r)}
                      disabled={busyId === r.id}
                    >
                      <Icon.Trash size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} reviews
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
        </div>
      )}

      {/* Single delete modal */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} size="sm" title="Delete review">
        {deleting && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Permanently delete this review from{" "}
              <strong className="text-foreground">{deleting.author.name}</strong>? This
              can&apos;t be undone — consider hiding it instead.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={busyId === deleting.id}>
                <Icon.Trash size={16} /> Delete review
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk delete modal */}
      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        size="sm"
        title="Bulk delete reviews"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">
            Permanently delete{" "}
            <strong className="text-foreground">{selected.size}</strong> selected review
            {selected.size !== 1 ? "s" : ""}? This can&apos;t be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={bulkDelete} loading={bulkBusy}>
              <Icon.Trash size={16} /> Delete {selected.size} review{selected.size !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <Icon.StarFill key={n} size={14} className="text-amber-500" />
        ) : (
          <Icon.Star key={n} size={14} className="text-[var(--muted-2)]" />
        ),
      )}
    </span>
  );
}
