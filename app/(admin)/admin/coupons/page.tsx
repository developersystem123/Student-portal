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
  Switch,
  useToast,
} from "@/components/ui";
import Icon from "@/components/icons";
import { formatDate } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
};

type TypeFilter = "all" | "percent" | "fixed";
type StatusFilter = "all" | "active" | "expired" | "used";
type CouponSortKey = "newest" | "oldest" | "value-high" | "value-low" | "most-used";
const PAGE_SIZE = 10;

export default function AdminCouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Coupon | null>(null);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [sortKey, setSortKey] = React.useState<CouponSortKey>("newest");
  const [page, setPage] = React.useState(1);

  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<"percent" | "fixed">("percent");
  const [value, setValue] = React.useState("20");
  const [maxUses, setMaxUses] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/coupons");
    const data = r.ok ? await r.json() : { coupons: [] };
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setCode("");
    setType("percent");
    setValue("20");
    setMaxUses("");
    setExpiresAt("");
    setFormOpen(true);
  }

  async function create() {
    setSaving(true);
    const numericValue =
      type === "fixed" ? Math.round(Number(value) * 100) : Math.round(Number(value));
    const r = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: numericValue,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt || null,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      toast.push({ title: "Couldn't create coupon", description: e.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Coupon created", tone: "success" });
    setFormOpen(false);
    load();
  }

  async function toggleActive(c: Coupon) {
    const r = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (r.ok) load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const r = await fetch(`/api/admin/coupons/${deleting.id}`, { method: "DELETE" });
    if (r.ok) {
      toast.push({ title: "Coupon deleted", tone: "info" });
      setDeleting(null);
      load();
    }
  }

  function discountLabel(c: Coupon) {
    return c.type === "percent" ? `${c.value}% off` : `$${(c.value / 100).toFixed(2)} off`;
  }

  const filtered = React.useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();
    const base = coupons.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (statusFilter === "active" && (!c.active || (c.expiresAt && new Date(c.expiresAt).getTime() < now))) return false;
      if (statusFilter === "expired" && !(c.expiresAt && new Date(c.expiresAt).getTime() < now)) return false;
      if (statusFilter === "used" && !(c.maxUses !== undefined && c.usedCount >= c.maxUses)) return false;
      if (q && !c.code.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...base].sort((a, b) => {
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "value-high") return b.value - a.value;
      if (sortKey === "value-low") return a.value - b.value;
      if (sortKey === "most-used") return b.usedCount - a.usedCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [coupons, query, typeFilter, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [query, typeFilter, statusFilter, sortKey]);

  const activeFilters = (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (query ? 1 : 0);
  function clearFilters() { setQuery(""); setTypeFilter("all"); setStatusFilter("all"); setSortKey("newest"); setPage(1); }

  function exportCsv() {
    const header = "Code,Type,Discount,Used,Max Uses,Active,Expires\n";
    const csv = filtered.map((c) => [
      c.code, c.type, discountLabel(c), c.usedCount,
      c.maxUses !== undefined ? c.maxUses : "unlimited",
      c.active ? "Yes" : "No",
      c.expiresAt ? c.expiresAt.slice(0, 10) : "Never",
    ].join(",")).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupons-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  const couponStats = React.useMemo(() => {
    const active = coupons.filter((c) => c.active && !(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())).length;
    const expired = coupons.filter((c) => c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()).length;
    const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);
    return { active, expired, totalUses };
  }, [coupons]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="mt-1 text-[var(--muted)]">
            Create discount codes students can apply at checkout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Icon.Download size={16} /> Export CSV
          </Button>
          <Button onClick={openCreate}>
            <Icon.Plus size={16} /> New coupon
          </Button>
        </div>
      </div>

      {coupons.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active coupons", value: couponStats.active, icon: <Icon.Tag size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
            { label: "Total uses", value: couponStats.totalUses, icon: <Icon.TrendingUp size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
            { label: "Expired", value: couponStats.expired, icon: <Icon.Clock size={16} />, tint: couponStats.expired > 0 ? "bg-red-500/10 text-red-500" : "bg-[var(--surface-2)] text-[var(--muted)]" },
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
      )}

      {/* Search + Filter + Sort */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code…"
            icon={<Icon.Search size={16} />}
            className="max-w-xs"
          />
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs px-2.5 py-1.5 rounded-lg text-primary bg-primary-soft hover:opacity-80 transition flex items-center gap-1">
              <Icon.X size={11} /> Clear ({activeFilters})
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted font-medium mr-1">{filtered.length} coupon{filtered.length !== 1 ? "s" : ""}</p>
          <div className="h-4 w-px bg-border mx-1" />
          <span className="text-xs text-muted font-medium mr-1">Type:</span>
          {(["all", "percent", "fixed"] as TypeFilter[]).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)} className={`h-8 px-3 rounded-lg text-xs font-medium transition ${typeFilter === f ? "bg-primary text-white" : "border border-border text-muted hover:bg-surface-2"}`}>
              {f === "all" ? "All" : f === "percent" ? "% Off" : "$ Off"}
            </button>
          ))}
          <span className="text-xs text-muted font-medium ml-3 mr-1">Status:</span>
          {(["all", "active", "expired", "used"] as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`h-8 px-3 rounded-lg text-xs font-medium transition capitalize ${statusFilter === f ? "bg-primary text-white" : "border border-border text-muted hover:bg-surface-2"}`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
          <span className="text-xs text-muted font-medium ml-3 mr-1">Sort:</span>
          {([
            { key: "newest", label: "Newest" },
            { key: "oldest", label: "Oldest" },
            { key: "value-high", label: "Value ↓" },
            { key: "value-low", label: "Value ↑" },
            { key: "most-used", label: "Most used" },
          ] as { key: CouponSortKey; label: string }[]).map((o) => (
            <button key={o.key} onClick={() => setSortKey(o.key)} className={`h-8 px-3 rounded-lg text-xs font-medium transition ${sortKey === o.key ? "bg-primary text-white" : "border border-border text-muted hover:bg-surface-2"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          </CardBody>
        </Card>
      ) : coupons.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.Tag size={28} />}
              title="No coupons yet"
              description="Create your first discount code."
              action={
                <Button onClick={openCreate}>
                  <Icon.Plus size={16} /> New coupon
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)] text-xs uppercase tracking-wider">
                <tr>
                  <Th>Code</Th>
                  <Th>Discount</Th>
                  <Th>Usage</Th>
                  <Th>Expires</Th>
                  <Th>Active</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => {
                  const exhausted = c.maxUses !== undefined && c.usedCount >= c.maxUses;
                  const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={c.id} className="border-t border-[var(--border)]">
                      <Td>
                        <span className="font-mono font-semibold">{c.code}</span>
                        {(exhausted || expired) && (
                          <Badge variant="danger" className="ml-2">
                            {expired ? "Expired" : "Used up"}
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <Badge variant="primary">{discountLabel(c)}</Badge>
                      </Td>
                      <Td className="text-xs">
                        {c.usedCount}
                        {c.maxUses !== undefined ? ` / ${c.maxUses}` : " (unlimited)"}
                      </Td>
                      <Td className="text-xs text-[var(--muted)]">
                        {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                      </Td>
                      <Td>
                        <Switch checked={c.active} onChange={() => toggleActive(c)} />
                      </Td>
                      <Td className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(c)}>
                          <Icon.Trash size={14} />
                        </Button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border flex-wrap">
              <p className="text-sm text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}><Icon.ChevronLeft size={16} /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(p); return acc; }, [])
                  .map((p, idx) => p === "…"
                    ? <span key={`e-${idx}`} className="px-2 text-muted text-sm">…</span>
                    : <button key={p} onClick={() => setPage(p as number)} className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-primary text-white" : "border border-border hover:bg-surface-2"}`}>{p}</button>
                  )}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><Icon.ChevronRight size={16} /></Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} size="md" title="New coupon">
        <div className="p-5 space-y-4">
          <div>
            <Label>Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="e.g. SAVE20"
              maxLength={20}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as "percent" | "fixed")}
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </Select>
            </div>
            <div>
              <Label>{type === "percent" ? "Percent (%)" : "Amount ($)"}</Label>
              <Input
                type="number"
                min={1}
                max={type === "percent" ? 100 : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max uses (optional)</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label>Expires (optional)</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={create} loading={saving} disabled={code.length < 3}>
              <Icon.Tag size={16} /> Create coupon
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} size="sm" title="Delete coupon?">
        {deleting && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Delete coupon{" "}
              <strong className="text-[var(--foreground)] font-mono">{deleting.code}</strong>?
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
