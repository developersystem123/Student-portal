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
  useToast,
} from "@/components/ui";
import Icon from "@/components/icons";
import { useAdmin, useData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

type SortKey = "newest" | "oldest" | "score-high" | "score-low" | "student" | "course";
const PAGE_SIZE = 10;

type CertRow = {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  score: number;
  verifyCode: string;
  issuedAt: string;
};

export default function AdminCertificatesPage() {
  const admin = useAdmin();
  const { courses } = useData();
  const toast = useToast();
  const students = admin.listStudents();

  const [certs, setCerts] = React.useState<CertRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [page, setPage] = React.useState(1);

  const [issueOpen, setIssueOpen] = React.useState(false);
  const [studentId, setStudentId] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [score, setScore] = React.useState("80");
  const [saving, setSaving] = React.useState(false);
  const [revoking, setRevoking] = React.useState<CertRow | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/certificates");
    const data = await r.json();
    setCerts(data.certificates ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? certs.filter(
          (c) =>
            c.studentName.toLowerCase().includes(q) ||
            c.studentEmail.toLowerCase().includes(q) ||
            c.courseTitle.toLowerCase().includes(q) ||
            c.verifyCode.toLowerCase().includes(q),
        )
      : certs;
    return [...base].sort((a, b) => {
      if (sortKey === "oldest") return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      if (sortKey === "score-high") return b.score - a.score;
      if (sortKey === "score-low") return a.score - b.score;
      if (sortKey === "student") return a.studentName.localeCompare(b.studentName);
      if (sortKey === "course") return a.courseTitle.localeCompare(b.courseTitle);
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    });
  }, [certs, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [query, sortKey]);

  function exportCsv() {
    const header = "Student,Email,Course,Score,Issued,Verify Code\n";
    const csv = filtered.map((c) => [
      `"${c.studentName}"`, `"${c.studentEmail}"`, `"${c.courseTitle}"`,
      `${c.score}%`, c.issuedAt.slice(0, 10), c.verifyCode,
    ].join(",")).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  async function issue() {
    const n = Number(score);
    if (!studentId || !courseId) {
      toast.push({ title: "Select a student and a course", tone: "danger" });
      return;
    }
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.push({ title: "Score must be between 0 and 100", tone: "danger" });
      return;
    }
    setSaving(true);
    const r = await fetch("/api/admin/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: studentId, courseId, score: n }),
    });
    setSaving(false);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      toast.push({ title: "Couldn't issue certificate", description: e.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Certificate issued", tone: "success" });
    setIssueOpen(false);
    setStudentId("");
    setCourseId("");
    setScore("80");
    load();
  }

  async function confirmRevoke() {
    if (!revoking) return;
    const r = await fetch(`/api/admin/certificates/${revoking.id}`, { method: "DELETE" });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      toast.push({ title: "Couldn't revoke", description: e.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Certificate revoked", tone: "info" });
    setRevoking(null);
    load();
  }

  const eligibleStudents = React.useMemo(() => {
    if (!courseId) {
      // No course selected — exclude students who already have ANY certificate
      const certifiedIds = new Set(certs.map((c) => c.userId));
      return students.filter((s) => !certifiedIds.has(s.id));
    }
    // Course selected — exclude students who already have a cert for this specific course
    const certifiedForCourse = new Set(
      certs.filter((c) => c.courseId === courseId).map((c) => c.userId),
    );
    return students.filter((s) => !certifiedForCourse.has(s.id));
  }, [students, certs, courseId]);

  const certStats = React.useMemo(() => {
    const avgScore = certs.length ? Math.round(certs.reduce((s, c) => s + c.score, 0) / certs.length) : 0;
    const highScore = certs.filter((c) => c.score >= 90).length;
    return { total: certs.length, avgScore, highScore };
  }, [certs]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="mt-1 text-[var(--muted)]">
            Every certificate issued across the platform — issue new ones or revoke.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Icon.Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => setIssueOpen(true)}>
            <Icon.Plus size={16} /> Issue certificate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total issued", value: certStats.total, icon: <Icon.Award size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
          { label: "Average score", value: certStats.total ? `${certStats.avgScore}%` : "—", icon: <Icon.TrendingUp size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Score ≥ 90%", value: certStats.highScore, icon: <Icon.Star size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
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

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student, course or code…"
          icon={<Icon.Search size={16} />}
          className="sm:w-80"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="text-sm text-[var(--muted)] font-medium mr-1">{filtered.length} cert{filtered.length !== 1 ? "s" : ""}</p>
          <div className="h-4 w-px bg-[var(--border)] mx-1" />
          <span className="text-xs text-[var(--muted)] font-medium mr-1">Sort:</span>
          {([
            { key: "newest", label: "Newest" },
            { key: "oldest", label: "Oldest" },
            { key: "score-high", label: "Score ↓" },
            { key: "score-low", label: "Score ↑" },
            { key: "student", label: "Student" },
            { key: "course", label: "Course" },
          ] as { key: SortKey; label: string }[]).map((o) => (
            <button
              key={o.key}
              onClick={() => setSortKey(o.key)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition ${sortKey === o.key ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
            >
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
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon.Award size={28} />}
              title={certs.length === 0 ? "No certificates issued yet" : "No matches"}
              description={
                certs.length === 0
                  ? "Issue a certificate to a student who has completed a course."
                  : "Try a different search term."
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
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Score</Th>
                  <Th>Issued</Th>
                  <Th>Verify code</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]/50"
                  >
                    <Td>
                      <div className="font-medium">{c.studentName}</div>
                      <div className="text-xs text-[var(--muted)]">{c.studentEmail}</div>
                    </Td>
                    <Td>
                      <div className="truncate max-w-[22ch]">{c.courseTitle}</div>
                    </Td>
                    <Td>
                      <Badge variant={c.score >= 60 ? "success" : "warning"}>{c.score}%</Badge>
                    </Td>
                    <Td className="text-xs text-[var(--muted)]">{formatDate(c.issuedAt)}</Td>
                    <Td>
                      <span className="font-mono text-xs">{c.verifyCode}</span>
                    </Td>
                    <Td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setRevoking(c)} title="Revoke">
                        <Icon.Trash size={14} /> Revoke
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] flex-wrap">
              <p className="text-sm text-[var(--muted)]">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}><Icon.ChevronLeft size={16} /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(p); return acc; }, [])
                  .map((p, idx) => p === "…"
                    ? <span key={`e-${idx}`} className="px-2 text-[var(--muted)] text-sm">…</span>
                    : <button key={p} onClick={() => setPage(p as number)} className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--surface-2)]"}`}>{p}</button>
                  )}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><Icon.ChevronRight size={16} /></Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Issue modal */}
      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} size="md" title="Issue certificate">
        <div className="p-6 space-y-5">
          {/* Student */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Student</Label>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-medium">
                {eligibleStudents.length} eligible
              </span>
            </div>
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select a student…</option>
              {eligibleStudents.length === 0 ? (
                <option disabled value="">All students already have a certificate</option>
              ) : (
                eligibleStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.email}
                  </option>
                ))
              )}
            </Select>
            {eligibleStudents.length === 0 && (
              <p className="text-xs text-[var(--muted)] mt-1">All students already hold a certificate for this course.</p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Course</Label>
            <Select value={courseId} onChange={(e) => { setCourseId(e.target.value); setStudentId(""); }}>
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Score (%)</Label>
              <span className={`text-xs font-semibold ${Number(score) >= 60 ? "text-emerald-600" : "text-red-500"}`}>
                {score ? `${score}%` : "—"}
              </span>
            </div>
            <Input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0–100"
            />
            <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${Number(score) >= 90 ? "bg-emerald-500" : Number(score) >= 60 ? "bg-[var(--primary)]" : "bg-red-400"}`}
                style={{ width: `${Math.min(100, Math.max(0, Number(score) || 0))}%` }}
              />
            </div>
            <p className="text-xs text-[var(--muted)]">Minimum passing score is 60%.</p>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setIssueOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={issue} loading={saving} disabled={!studentId || !courseId}>
              <Icon.Award size={16} /> Issue certificate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke confirm */}
      <Modal open={!!revoking} onClose={() => setRevoking(null)} size="sm" title="Revoke certificate?">
        {revoking && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Revoke the certificate for{" "}
              <strong className="text-[var(--foreground)]">{revoking.studentName}</strong> in{" "}
              <strong className="text-[var(--foreground)]">{revoking.courseTitle}</strong>? The
              verification code will stop working.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRevoking(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmRevoke}>
                <Icon.Trash size={16} /> Revoke
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
