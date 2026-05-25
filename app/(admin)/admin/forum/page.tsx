"use client";

import * as React from "react";
import {
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

type Category = "general" | "question" | "announcement" | "discussion";

type Post = {
  id: string;
  title: string;
  body: string;
  category: Category;
  pinned: boolean;
  views: number;
  createdAt: string;
  authorName: string;
  authorEmail: string;
  courseTitle?: string;
  replyCount: number;
};

const CATEGORY_BADGE: Record<Category, "default" | "info" | "primary" | "warning"> = {
  general: "default",
  question: "info",
  announcement: "warning",
  discussion: "primary",
};

type Filter = "all" | Category;
type SortKey = "newest" | "oldest" | "views" | "replies";
type PinnedFilter = "all" | "pinned" | "unpinned";

const PAGE_SIZE = 10;

export default function AdminForumPage() {
  const toast = useToast();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [pinnedFilter, setPinnedFilter] = React.useState<PinnedFilter>("all");
  const [deleting, setDeleting] = React.useState<Post | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/forum");
    const data = await r.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(
    () => ({
      all: posts.length,
      general: posts.filter((p) => p.category === "general").length,
      question: posts.filter((p) => p.category === "question").length,
      announcement: posts.filter((p) => p.category === "announcement").length,
      discussion: posts.filter((p) => p.category === "discussion").length,
    }),
    [posts],
  );

  const forumStats = React.useMemo(
    () => ({
      total: posts.length,
      pinned: posts.filter((p) => p.pinned).length,
      totalReplies: posts.reduce((s, p) => s + p.replyCount, 0),
      totalViews: posts.reduce((s, p) => s + p.views, 0),
    }),
    [posts],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = posts.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (pinnedFilter === "pinned" && !p.pinned) return false;
      if (pinnedFilter === "unpinned" && p.pinned) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "views") return b.views - a.views;
      if (sortKey === "replies") return b.replyCount - a.replyCount;
      return 0;
    });

    return result;
  }, [posts, filter, query, sortKey, pinnedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filter, query, sortKey, pinnedFilter]);

  const activeFilters = React.useMemo(() => {
    let n = 0;
    if (query.trim()) n++;
    if (filter !== "all") n++;
    if (pinnedFilter !== "all") n++;
    return n;
  }, [query, filter, pinnedFilter]);

  function clearFilters() {
    setQuery("");
    setFilter("all");
    setPinnedFilter("all");
    setSortKey("newest");
    setPage(1);
  }

  async function togglePin(p: Post) {
    setBusy(p.id);
    const r = await fetch(`/api/admin/forum/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !p.pinned }),
    });
    setBusy(null);
    if (!r.ok) {
      toast.push({ title: "Couldn't update post", tone: "danger" });
      return;
    }
    toast.push({ title: p.pinned ? "Post unpinned" : "Post pinned", tone: "success" });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const r = await fetch(`/api/admin/forum/${deleting.id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.push({ title: "Couldn't delete post", tone: "danger" });
      return;
    }
    toast.push({ title: "Post deleted", tone: "info" });
    setDeleting(null);
    load();
  }

  function exportCsv() {
    const header = ["Title", "Author", "Category", "Pinned", "Replies", "Views", "Course", "Date"];
    const rows = filtered.map((p) => [
      p.title.replace(/"/g, '""'),
      p.authorName,
      p.category,
      p.pinned ? "Yes" : "No",
      String(p.replyCount),
      String(p.views),
      p.courseTitle ?? "",
      p.createdAt,
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forum-posts.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "CSV exported", tone: "success" });
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "views", label: "Views" },
    { key: "replies", label: "Replies" },
  ];

  const PINNED_OPTIONS: { key: PinnedFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pinned", label: "Pinned" },
    { key: "unpinned", label: "Unpinned" },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Forum moderation</h1>
          <p className="mt-1 text-muted">
            Review community posts — pin important ones or remove anything inappropriate.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Icon.Download size={15} /> Export CSV
        </Button>
      </div>

      {/* Stat cards — always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total posts", value: forumStats.total, icon: <Icon.MessageSquare size={16} />, tint: "bg-primary-soft text-primary" },
          { label: "Pinned", value: forumStats.pinned, icon: <Icon.Pin size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { label: "Total replies", value: forumStats.totalReplies, icon: <Icon.MessageSquare size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Total views", value: forumStats.totalViews, icon: <Icon.Eye size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
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
            { value: "question", label: "Questions", count: counts.question },
            { value: "discussion", label: "Discussion", count: counts.discussion },
            { value: "announcement", label: "Announcements", count: counts.announcement },
            { value: "general", label: "General", count: counts.general },
          ]}
        />
        <div className="md:w-80">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts or authors…"
            icon={<Icon.Search size={16} />}
          />
        </div>
      </div>

      {/* Row 2: Count + Sort + Pinned filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted font-medium mr-1">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>
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
        <span className="text-xs text-muted font-medium ml-3 mr-1">Pinned:</span>
        {PINNED_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setPinnedFilter(o.key)}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition ${pinnedFilter === o.key ? "bg-[var(--primary)] text-white" : "border border-border text-muted hover:bg-surface-2"}`}
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

      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-12 text-muted">
              <Icon.Loader size={18} /> Loading posts…
            </div>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.MessageSquare size={28} />}
              title={posts.length === 0 ? "No forum posts yet" : "No matching posts"}
              description={
                posts.length === 0
                  ? "Community posts will appear here for moderation."
                  : "Try a different filter or search."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Row count */}
          <p className="text-sm text-muted px-1">
            {filtered.length} post{filtered.length !== 1 ? "s" : ""}
          </p>

          {paginated.map((p) => (
            <Card key={p.id}>
              <CardBody className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.pinned && (
                      <Badge variant="primary">
                        <Icon.Pin size={11} /> Pinned
                      </Badge>
                    )}
                    <Badge variant={CATEGORY_BADGE[p.category]} className="capitalize">
                      {p.category}
                    </Badge>
                    <span className="text-xs text-[var(--muted-2)]">
                      {relativeTime(p.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold mt-1.5 truncate">{p.title}</h3>
                  <p className="text-sm text-muted mt-0.5 line-clamp-2">{p.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-2)]">
                    <span>By {p.authorName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Icon.MessageSquare size={12} /> {p.replyCount}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Icon.Eye size={12} /> {p.views}
                    </span>
                    {p.courseTitle && (
                      <>
                        <span>·</span>
                        <span className="truncate">{p.courseTitle}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant={p.pinned ? "soft" : "outline"}
                    onClick={() => togglePin(p)}
                    loading={busy === p.id}
                  >
                    <Icon.Pin size={14} /> {p.pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleting(p)}>
                    <Icon.Trash size={14} /> Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} posts
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

      <Modal open={!!deleting} onClose={() => setDeleting(null)} size="sm" title="Delete post?">
        {deleting && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted">
              Delete <strong className="text-foreground">{deleting.title}</strong> and all
              its replies? This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                <Icon.Trash size={16} /> Delete post
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
