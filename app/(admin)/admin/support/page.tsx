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
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import Icon from "@/components/icons";
import { relativeTime } from "@/lib/utils";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

type Ticket = {
  id: string;
  subject: string;
  body: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
};

type Reply = {
  id: string;
  body: string;
  createdAt: string;
  isStaff: boolean;
  author: { id: string; name: string; avatar: string | null; role: string };
};

type TicketDetail = {
  id: string;
  subject: string;
  body: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
};

type Filter = "all" | TicketStatus;
type SortKey = "newest" | "oldest" | "priority" | "updated";
type PriorityFilter = "all" | TicketPriority;

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_BADGE: Record<TicketStatus, "info" | "warning" | "success" | "default"> = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "default",
};

const PRIORITY_BADGE: Record<TicketPriority, "default" | "info" | "warning" | "danger"> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
  { value: "updated", label: "Updated" },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function AdminSupportPage() {
  const toast = useToast();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all");
  const [page, setPage] = React.useState(1);

  const [openId, setOpenId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replying, setReplying] = React.useState(false);
  const [statusDraft, setStatusDraft] = React.useState<TicketStatus>("open");
  const [priorityDraft, setPriorityDraft] = React.useState<TicketPriority>("medium");
  const [savingMeta, setSavingMeta] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) setTickets(data.tickets ?? []);
      else toast.push({ title: data.error ?? "Failed to load tickets.", tone: "danger" });
    } catch {
      toast.push({ title: "Failed to load tickets.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!openId) {
      setDetail(null);
      setReplyText("");
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/support/${openId}`, { credentials: "same-origin" });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setDetail(data.ticket);
          setStatusDraft(data.ticket.status);
          setPriorityDraft(data.ticket.priority);
        } else {
          toast.push({ title: data.error ?? "Failed to load ticket.", tone: "danger" });
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [openId, toast]);

  const counts = React.useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
      urgent: tickets.filter((t) => t.priority === "urgent").length,
    }),
    [tickets],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "priority") return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (sortKey === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

    return result;
  }, [tickets, filter, query, sortKey, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filter, query, sortKey, priorityFilter]);

  const activeFilters = React.useMemo(() => {
    let count = 0;
    if (sortKey !== "newest") count++;
    if (priorityFilter !== "all") count++;
    if (query.trim()) count++;
    return count;
  }, [sortKey, priorityFilter, query]);

  const clearFilters = React.useCallback(() => {
    setSortKey("newest");
    setPriorityFilter("all");
    setQuery("");
  }, []);

  const exportCSV = React.useCallback(() => {
    const headers = ["Subject", "Requester", "Email", "Category", "Priority", "Status", "Replies", "Updated"];
    const rows = filtered.map((t) => [
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${t.userName.replace(/"/g, '""')}"`,
      t.userEmail,
      t.category,
      t.priority,
      t.status,
      t.replyCount,
      t.updatedAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "support-tickets.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  async function sendReply() {
    if (!detail || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/support/${detail.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ body: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ title: data.error ?? "Reply failed.", tone: "danger" });
        return;
      }
      const reply: Reply = {
        id: data.reply.id,
        body: data.reply.body,
        createdAt: data.reply.createdAt,
        isStaff: data.reply.isStaff,
        author: { id: "", name: "You", avatar: null, role: "Admin" },
      };
      setDetail((d) => (d ? { ...d, replies: [...d.replies, reply] } : d));
      setReplyText("");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === detail.id
            ? { ...t, replyCount: t.replyCount + 1, updatedAt: reply.createdAt }
            : t,
        ),
      );
      toast.push({ title: "Reply sent", tone: "success" });
    } catch {
      toast.push({ title: "Reply failed.", tone: "danger" });
    } finally {
      setReplying(false);
    }
  }

  async function saveMeta() {
    if (!detail) return;
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/admin/support/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: statusDraft, priority: priorityDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ title: data.error ?? "Update failed.", tone: "danger" });
        return;
      }
      setDetail((d) => (d ? { ...d, status: statusDraft, priority: priorityDraft } : d));
      setTickets((prev) =>
        prev.map((t) =>
          t.id === detail.id ? { ...t, status: statusDraft, priority: priorityDraft } : t,
        ),
      );
      toast.push({ title: "Ticket updated", tone: "success" });
    } catch {
      toast.push({ title: "Update failed.", tone: "danger" });
    } finally {
      setSavingMeta(false);
    }
  }

  const metaChanged =
    !!detail && (statusDraft !== detail.status || priorityDraft !== detail.priority);

  const pillBase = "text-xs px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap cursor-pointer";
  const pillActive = "bg-[var(--primary)] text-white";
  const pillInactive = "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">Support tickets</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Respond to student support requests, set priorities, and track each ticket to resolution.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="shrink-0 flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition"
        >
          <Icon.Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center text-[var(--primary)] shrink-0">
              <Icon.Inbox size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Open</div>
              <div className="text-xl font-bold leading-tight">{counts.open}</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
              <Icon.Clock size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">In progress</div>
              <div className="text-xl font-bold leading-tight">{counts.in_progress}</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 shrink-0">
              <Icon.CheckCircle size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Resolved</div>
              <div className="text-xl font-bold leading-tight">{counts.resolved}</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
              <Icon.AlertCircle size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Urgent</div>
              <div className="text-xl font-bold leading-tight">{counts.urgent}</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="space-y-3">
        {/* Status filter + search */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "open", "in_progress", "resolved", "closed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${pillBase} ${filter === f ? pillActive : pillInactive}`}
              >
                {f === "all" ? "All" : STATUS_LABEL[f as TicketStatus]}
                {" "}
                <span className="opacity-70">
                  {f === "all" ? counts.all : counts[f as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
          <div className="md:ml-auto md:w-72">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, requester…"
              icon={<Icon.Search size={16} />}
            />
          </div>
        </div>

        {/* Sort + Priority filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)] font-medium shrink-0">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortKey(opt.value)}
              className={`${pillBase} ${sortKey === opt.value ? pillActive : pillInactive}`}
            >
              {opt.label}
            </button>
          ))}
          <span className="text-xs text-[var(--muted)] font-medium shrink-0 ml-2">Priority:</span>
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPriorityFilter(opt.value)}
              className={`${pillBase} ${priorityFilter === opt.value ? pillActive : pillInactive}`}
            >
              {opt.label}
            </button>
          ))}
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-80 transition whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <Icon.X size={11} /> Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--muted)]">
              <Icon.Loader size={18} /> Loading tickets…
            </div>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.Inbox size={28} />}
              title="No tickets"
              description={
                tickets.length === 0
                  ? "No support tickets have been raised yet."
                  : "No tickets match the current filter."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)] text-xs uppercase tracking-wider">
                <tr>
                  <Th>Requester</Th>
                  <Th>Subject</Th>
                  <Th>Category</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]/50 cursor-pointer"
                    onClick={() => setOpenId(t.id)}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar src={t.userAvatar} name={t.userName} size={32} />
                        <div>
                          <div className="font-medium">{t.userName}</div>
                          <div className="text-xs text-[var(--muted)]">{t.userEmail}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="font-medium truncate max-w-[28ch]">{t.subject}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {t.replyCount} {t.replyCount === 1 ? "reply" : "replies"}
                      </div>
                    </Td>
                    <Td className="capitalize text-xs">{t.category}</Td>
                    <Td>
                      <Badge variant={PRIORITY_BADGE[t.priority]} className="capitalize">
                        {t.priority}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant={STATUS_BADGE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                    </Td>
                    <Td className="text-xs text-[var(--muted)]">{relativeTime(t.updatedAt)}</Td>
                    <Td className="text-right">
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(t.id);
                        }}
                      >
                        <Icon.Eye size={14} /> Open
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-[var(--border)]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <Icon.ChevronLeft size={15} />
              </button>
              {buildPageNumbers(currentPage, totalPages).map((pg, i) =>
                pg === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-[var(--muted)]">
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className={`min-w-[32px] h-8 text-xs rounded-lg font-medium transition ${
                      currentPage === pg
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    }`}
                  >
                    {pg}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <Icon.ChevronRight size={15} />
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Ticket detail modal */}
      <Modal
        open={!!openId}
        onClose={() => setOpenId(null)}
        size="lg"
        title={detail ? detail.subject : "Ticket"}
      >
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto scrollbar-thin">
          {detailLoading || !detail ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--muted)]">
              <Icon.Loader size={18} /> Loading ticket…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={STATUS_BADGE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
                <Badge variant={PRIORITY_BADGE[detail.priority]} className="capitalize">
                  {detail.priority} priority
                </Badge>
                <span className="text-xs text-[var(--muted)] capitalize">{detail.category}</span>
                <span className="text-xs text-[var(--muted)]">
                  · opened {relativeTime(detail.createdAt)}
                </span>
              </div>

              {/* Original message */}
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold mb-1.5">
                  Original message
                </p>
                <p className="text-sm whitespace-pre-wrap break-words">{detail.body}</p>
              </div>

              {/* Conversation */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-2)] font-semibold">
                  Conversation ({detail.replies.length})
                </p>
                {detail.replies.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No replies yet.</p>
                ) : (
                  detail.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-xl p-3 text-sm ${
                        r.isStaff
                          ? "bg-[var(--primary-soft)] ml-6"
                          : "bg-[var(--surface-2)] mr-6"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs">{r.author.name}</span>
                        {r.isStaff && <Badge variant="primary">Staff</Badge>}
                        <span className="text-[10px] text-[var(--muted)]">
                          {relativeTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{r.body}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              <div>
                <p className="text-sm font-medium mb-1.5">Reply as staff</p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the student…"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={sendReply} loading={replying} disabled={!replyText.trim()}>
                    <Icon.Send size={16} /> Send reply
                  </Button>
                </div>
              </div>

              {/* Status & priority controls */}
              <div className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-2)] font-semibold mb-3">
                  Manage ticket
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium mb-1.5">Status</p>
                    <Select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as TicketStatus)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1.5">Priority</p>
                    <Select
                      value={priorityDraft}
                      onChange={(e) => setPriorityDraft(e.target.value as TicketPriority)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    onClick={saveMeta}
                    loading={savingMeta}
                    disabled={!metaChanged}
                  >
                    <Icon.Save size={16} /> Save changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left font-semibold px-4 py-3 ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className ?? ""}`}>{children}</td>;
}
