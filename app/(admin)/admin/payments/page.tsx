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
  Select,
  useToast,
} from "@/components/ui";
import Icon from "@/components/icons";
import { relativeTime } from "@/lib/utils";

type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  txnId: string | null;
  description: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string | null;
  courseTitle: string | null;
};

type Summary = {
  grossRevenue: number;
  refunded: number;
  pending: number;
  failed: number;
  transactions: number;
  currency: string;
};

type Filter = "all" | PaymentStatus;
type SortKey = "newest" | "oldest" | "amount-high" | "amount-low";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_BADGE: Record<PaymentStatus, "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  completed: "success",
  failed: "danger",
  refunded: "info",
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount-high", label: "Amount (high)" },
  { value: "amount-low", label: "Amount (low)" },
];

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [managing, setManaging] = React.useState<Payment | null>(null);
  const [nextStatus, setNextStatus] = React.useState<PaymentStatus>("completed");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments ?? []);
        setSummary(data.summary ?? null);
      } else {
        toast.push({ title: data.error ?? "Failed to load payments.", tone: "danger" });
      }
    } catch {
      toast.push({ title: "Failed to load payments.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(
    () => ({
      all: payments.length,
      completed: payments.filter((p) => p.status === "completed").length,
      pending: payments.filter((p) => p.status === "pending").length,
      failed: payments.filter((p) => p.status === "failed").length,
      refunded: payments.filter((p) => p.status === "refunded").length,
    }),
    [payments],
  );

  const uniqueMethods = React.useMemo(() => {
    const methods = new Set(payments.map((p) => p.method).filter(Boolean));
    return Array.from(methods).sort();
  }, [payments]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = payments.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (methodFilter !== "all" && p.method !== methodFilter) return false;
      if (!q) return true;
      return (
        p.userName.toLowerCase().includes(q) ||
        p.userEmail.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.courseTitle ?? "").toLowerCase().includes(q) ||
        (p.txnId ?? "").toLowerCase().includes(q)
      );
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "amount-high") return b.amount - a.amount;
      if (sortKey === "amount-low") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [payments, filter, query, sortKey, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filter, query, sortKey, methodFilter]);

  const activeFilters = React.useMemo(() => {
    let count = 0;
    if (sortKey !== "newest") count++;
    if (methodFilter !== "all") count++;
    if (query.trim()) count++;
    return count;
  }, [sortKey, methodFilter, query]);

  const clearFilters = React.useCallback(() => {
    setSortKey("newest");
    setMethodFilter("all");
    setQuery("");
  }, []);

  const exportCSV = React.useCallback(() => {
    const headers = ["User", "Email", "Description", "Course", "Method", "Amount", "Status", "Date", "TxnId"];
    const rows = filtered.map((p) => [
      `"${p.userName.replace(/"/g, '""')}"`,
      p.userEmail,
      `"${p.description.replace(/"/g, '""')}"`,
      `"${(p.courseTitle ?? "").replace(/"/g, '""')}"`,
      p.method,
      (p.amount / 100).toFixed(2),
      p.status,
      p.createdAt,
      p.txnId ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  function openManage(p: Payment) {
    setManaging(p);
    setNextStatus(p.status);
  }

  async function saveStatus() {
    if (!managing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payments/${managing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ title: data.error ?? "Update failed.", tone: "danger" });
        return;
      }
      setPayments((prev) =>
        prev.map((p) => (p.id === managing.id ? { ...p, status: nextStatus } : p)),
      );
      toast.push({
        title: nextStatus === "refunded" ? "Payment refunded" : "Payment updated",
        tone: "success",
      });
      setManaging(null);
      load();
    } catch {
      toast.push({ title: "Update failed.", tone: "danger" });
    } finally {
      setSaving(false);
    }
  }

  const currency = summary?.currency ?? "USD";

  const pillBase = "text-xs px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap cursor-pointer";
  const pillActive = "bg-[var(--primary)] text-white";
  const pillInactive = "border border-border text-muted hover:border-[var(--primary)] hover:text-[var(--primary)]";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">Payments &amp; revenue</h1>
          <p className="text-sm text-muted mt-1">
            Every transaction on the platform — track revenue, settle pending charges, and issue refunds.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="shrink-0 flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border border-border text-muted hover:text-[var(--foreground)] hover:border-[var(--primary)] transition"
        >
          <Icon.Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 shrink-0">
              <Icon.DollarSign size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Gross revenue</div>
              <div className="text-lg font-bold leading-tight tabular-nums">
                {money(summary?.grossRevenue ?? 0, currency)}
              </div>
              <div className="text-[10px] text-muted">{summary?.transactions ?? 0} paid</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
              <Icon.ArrowLeft size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Refunded</div>
              <div className="text-lg font-bold leading-tight tabular-nums">
                {money(summary?.refunded ?? 0, currency)}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center text-[var(--primary)] shrink-0">
              <Icon.Clock size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Pending</div>
              <div className="text-xl font-bold leading-tight">{summary?.pending ?? 0}</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3 !py-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
              <Icon.AlertCircle size={18} />
            </div>
            <div>
              <div className="text-xs text-muted">Failed</div>
              <div className="text-xl font-bold leading-tight">{summary?.failed ?? 0}</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="space-y-3">
        {/* Status filter + search */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "completed", "pending", "failed", "refunded"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${pillBase} ${filter === f ? pillActive : pillInactive}`}
              >
                {f === "all" ? "All" : STATUS_LABEL[f as PaymentStatus]}
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
              placeholder="Search by user, course, txn…"
              icon={<Icon.Search size={16} />}
            />
          </div>
        </div>

        {/* Sort + Method filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted font-medium shrink-0">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortKey(opt.value)}
              className={`${pillBase} ${sortKey === opt.value ? pillActive : pillInactive}`}
            >
              {opt.label}
            </button>
          ))}
          {uniqueMethods.length > 0 && (
            <>
              <span className="text-xs text-muted font-medium shrink-0 ml-2">Method:</span>
              <button
                onClick={() => setMethodFilter("all")}
                className={`${pillBase} ${methodFilter === "all" ? pillActive : pillInactive}`}
              >
                All
              </button>
              {uniqueMethods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`${pillBase} capitalize ${methodFilter === m ? pillActive : pillInactive}`}
                >
                  {m}
                </button>
              ))}
            </>
          )}
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
            <div className="flex items-center justify-center gap-2 py-12 text-muted">
              <Icon.Loader size={18} /> Loading payments…
            </div>
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.CreditCard size={28} />}
              title="No payments"
              description={
                payments.length === 0
                  ? "No transactions have been recorded yet."
                  : "No payments match the current filter."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs text-muted">
              {filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-muted text-xs uppercase tracking-wider">
                <tr>
                  <Th>User</Th>
                  <Th>Description</Th>
                  <Th>Method</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-(--surface-2)/50">
                    <Td>
                      <div className="font-medium">{p.userName}</div>
                      <div className="text-xs text-muted">{p.userEmail}</div>
                    </Td>
                    <Td>
                      <div className="font-medium truncate max-w-[24ch]">{p.description}</div>
                      {p.courseTitle && (
                        <div className="text-xs text-muted truncate max-w-[24ch]">
                          {p.courseTitle}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span className="capitalize text-xs">{p.method}</span>
                    </Td>
                    <Td className="text-right font-semibold tabular-nums">
                      {money(p.amount, p.currency)}
                    </Td>
                    <Td>
                      <Badge variant={STATUS_BADGE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                    </Td>
                    <Td className="text-xs text-muted">{relativeTime(p.createdAt)}</Td>
                    <Td className="text-right">
                      <Button size="sm" variant="soft" onClick={() => openManage(p)}>
                        <Icon.Edit size={14} /> Manage
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border text-muted disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <Icon.ChevronLeft size={15} />
              </button>
              {buildPageNumbers(currentPage, totalPages).map((pg, i) =>
                pg === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted">
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className={`min-w-[32px] h-8 text-xs rounded-lg font-medium transition ${
                      currentPage === pg
                        ? "bg-[var(--primary)] text-white"
                        : "border border-border text-muted hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    }`}
                  >
                    {pg}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border text-muted disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                <Icon.ChevronRight size={15} />
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Manage modal */}
      <Modal
        open={!!managing}
        onClose={() => setManaging(null)}
        size="md"
        title="Manage payment"
      >
        {managing && (
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-border p-4 space-y-1.5 text-sm">
              <Row label="User" value={`${managing.userName} · ${managing.userEmail}`} />
              <Row label="Description" value={managing.description} />
              {managing.courseTitle && <Row label="Course" value={managing.courseTitle} />}
              <Row label="Amount" value={money(managing.amount, managing.currency)} />
              <Row label="Method" value={managing.method} />
              {managing.txnId && <Row label="Transaction" value={managing.txnId} />}
              <Row label="Created" value={relativeTime(managing.createdAt)} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Payment status</p>
              <Select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as PaymentStatus)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
              {nextStatus === "refunded" && managing.status !== "refunded" && (
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-1.5">
                  Marking this payment as refunded removes its amount from gross revenue.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setManaging(null)}>
                Cancel
              </Button>
              <Button onClick={saveStatus} loading={saving} disabled={nextStatus === managing.status}>
                <Icon.Save size={16} /> Save changes
              </Button>
            </div>
          </div>
        )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-right wrap-break-word font-medium">{value}</span>
    </div>
  );
}
