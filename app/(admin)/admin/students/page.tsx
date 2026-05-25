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
  useToast,
} from "@/components/ui";
import { useAdmin, type StudentSummary } from "@/lib/store";
import { cleanPhoneInput, validateEmail, validateName, validatePassword, validatePhone } from "@/lib/validation";

type FormMode = "create" | "edit" | "reset" | null;
type SortKey = "name" | "enrolled" | "completed" | "certificates";
type ProfileFilter = "all" | "complete" | "incomplete";
type CertFilter = "all" | "has-certs" | "no-certs";
const PAGE_SIZE = 10;

export default function AdminStudentsPage() {
  const admin = useAdmin();
  const toast = useToast();
  const [tick, setTick] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [profileFilter, setProfileFilter] = React.useState<ProfileFilter>("all");
  const [certFilter, setCertFilter] = React.useState<CertFilter>("all");
  const [page, setPage] = React.useState(1);
  const [mode, setMode] = React.useState<FormMode>(null);
  const [editing, setEditing] = React.useState<StudentSummary | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [detailStudent, setDetailStudent] = React.useState<StudentSummary | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const allStudents = React.useMemo(() => admin.listStudents(), [admin, tick]);

  const isComplete = (s: StudentSummary) => !!(s.phone?.trim()) && !!(s.education) && s.education !== "None";

  const students = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = allStudents
      .filter((s) => profileFilter === "all" ? true : profileFilter === "complete" ? isComplete(s) : !isComplete(s))
      .filter((s) => certFilter === "all" ? true : certFilter === "has-certs" ? s.certificateCount > 0 : s.certificateCount === 0)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    return [...base].sort((a, b) => {
      if (sortKey === "enrolled") return b.enrolledCount - a.enrolledCount;
      if (sortKey === "completed") return b.completedCount - a.completedCount;
      if (sortKey === "certificates") return b.certificateCount - a.certificateCount;
      return a.name.localeCompare(b.name);
    });
  }, [allStudents, query, sortKey, profileFilter, certFilter]);

  const activeFilters = (profileFilter !== "all" ? 1 : 0) + (certFilter !== "all" ? 1 : 0) + (query ? 1 : 0);
  function clearFilters() { setQuery(""); setProfileFilter("all"); setCertFilter("all"); setSortKey("name"); setPage(1); }
  React.useEffect(() => { setPage(1); setSelected(new Set()); }, [query, sortKey, profileFilter, certFilter]);

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = students.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = React.useMemo(() => {
    const complete = allStudents.filter(isComplete).length;
    const totalEnrolled = allStudents.reduce((s, x) => s + x.enrolledCount, 0);
    const totalCerts = allStudents.reduce((s, x) => s + x.certificateCount, 0);
    return { total: allStudents.length, complete, totalEnrolled, totalCerts };
  }, [allStudents]);

  const allPageSelected = paginated.length > 0 && paginated.every((s) => selected.has(s.id));
  const somePageSelected = paginated.some((s) => selected.has(s.id));
  function toggleSelect(id: string) { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function togglePage() { setSelected((prev) => { const next = new Set(prev); if (allPageSelected) paginated.forEach((s) => next.delete(s.id)); else paginated.forEach((s) => next.add(s.id)); return next; }); }

  function refresh() { setTick((t) => t + 1); }

  function exportCsv() {
    const header = "Name,Email,Phone,Profile,Enrolled,Completed,Certificates\n";
    const rows = students
      .map((s) => [`"${s.name}"`, `"${s.email}"`, `"${s.phone ?? ""}"`, isComplete(s) ? "Complete" : "Incomplete", s.enrolledCount, s.completedCount, s.certificateCount].join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  async function handleBulkDelete() {
    await Promise.all(Array.from(selected).map((id) => admin.deleteStudent(id)));
    toast.push({ title: `${selected.size} student${selected.size !== 1 ? "s" : ""} deleted`, tone: "info" });
    setSelected(new Set()); setBulkDeleteOpen(false); refresh();
  }

  function startCreate() { setEditing(null); setMode("create"); }
  function startEdit(s: StudentSummary) { setEditing(s); setMode("edit"); }
  function startReset(s: StudentSummary) { setEditing(s); setMode("reset"); }
  function handleDelete(id: string) { admin.deleteStudent(id); setConfirmDeleteId(null); toast.push({ title: "Student deleted", tone: "success" }); refresh(); }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-[var(--muted)]">Onboard learners from the office, edit details, reset passwords.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={students.length === 0}><Icon.Download size={16} /> Export CSV</Button>
          <Button onClick={startCreate}><Icon.Plus size={16} /> Add student</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total students", value: stats.total, icon: <Icon.User size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
          { label: "Complete profiles", value: stats.complete, icon: <Icon.CheckCircle size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Total enrollments", value: stats.totalEnrolled, icon: <Icon.ListChecks size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Certificates earned", value: stats.totalCerts, icon: <Icon.Award size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
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
              <Input icon={<Icon.Search size={16} />} placeholder="Search by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 sm:max-w-xs" />
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs px-2.5 py-1.5 rounded-lg text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-80 transition whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Icon.X size={11} /> Clear ({activeFilters})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--muted)] shrink-0">Sort by:</span>
              {(["name", "enrolled", "completed", "certificates"] as SortKey[]).map((k) => (
                <button key={k} onClick={() => setSortKey(k)} className={`px-3 h-8 rounded-lg text-xs font-medium capitalize transition border ${sortKey === k ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>{k}</button>
              ))}
            </div>
          </div>

          {/* Filter pills row 2 */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-[var(--muted)] mr-1">Profile:</span>
            {(["all", "complete", "incomplete"] as ProfileFilter[]).map((f) => (
              <button key={f} onClick={() => setProfileFilter(f)} className={`px-3 h-7 rounded-lg text-xs font-medium capitalize transition ${profileFilter === f ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                {f === "all" ? "All profiles" : f}
              </button>
            ))}
            <span className="text-xs text-[var(--muted)] ml-3 mr-1">Certificates:</span>
            {(["all", "has-certs", "no-certs"] as CertFilter[]).map((f) => (
              <button key={f} onClick={() => setCertFilter(f)} className={`px-3 h-7 rounded-lg text-xs font-medium transition ${certFilter === f ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                {f === "all" ? "All" : f === "has-certs" ? "Has certificates" : "No certificates"}
              </button>
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

          {students.length > 0 && (
            <p className="text-xs text-[var(--muted)]">
              {students.length === allStudents.length ? `${allStudents.length} student${allStudents.length !== 1 ? "s" : ""}` : `${students.length} of ${allStudents.length} students`}
            </p>
          )}

          {students.length === 0 ? (
            <EmptyState icon={<Icon.User size={20} />} title={activeFilters > 0 ? "No students match." : "No students yet."} description={activeFilters > 0 ? "Try clearing filters." : "Add your first student to get started."} action={activeFilters === 0 ? <Button onClick={startCreate}><Icon.Plus size={16} /> Add student</Button> : undefined} />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 w-10">
                      <input type="checkbox" checked={allPageSelected} ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }} onChange={togglePage} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" />
                    </th>
                    <th className="font-medium py-2.5 px-3">Student</th>
                    <th className="font-medium py-2.5 px-3 hidden md:table-cell">Phone</th>
                    <th className="font-medium py-2.5 px-3 text-center hidden lg:table-cell">Profile</th>
                    <th className="font-medium py-2.5 px-3 text-center">Enrolled</th>
                    <th className="font-medium py-2.5 px-3 text-center hidden sm:table-cell">Completed</th>
                    <th className="font-medium py-2.5 px-3 text-center hidden sm:table-cell">Certificates</th>
                    <th className="font-medium py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 transition cursor-pointer ${selected.has(s.id) ? "bg-[var(--primary-soft)]/30" : ""}`}
                      onClick={() => setDetailStudent(s)}
                    >
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-semibold inline-flex items-center justify-center text-sm shrink-0">{s.name.slice(0, 1).toUpperCase()}</div>
                          <div className="min-w-0"><p className="font-medium truncate">{s.name}</p><p className="text-xs text-[var(--muted)] truncate">{s.email}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-[var(--muted)]">{s.phone || "—"}</td>
                      <td className="py-3 px-3 text-center hidden lg:table-cell">
                        {isComplete(s) ? <Badge variant="success">Complete</Badge> : <Badge variant="warning">Incomplete</Badge>}
                      </td>
                      <td className="py-3 px-3 text-center"><Badge variant="default">{s.enrolledCount}</Badge></td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell"><Badge variant="success">{s.completedCount}</Badge></td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell"><Badge variant="primary">{s.certificateCount}</Badge></td>
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1">
                          <button onClick={() => startEdit(s)} title="Edit" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition"><Icon.FilePen size={14} /></button>
                          <button onClick={() => startReset(s)} title="Reset password" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition"><Icon.Lock size={14} /></button>
                          <button onClick={() => setConfirmDeleteId(s.id)} title="Delete" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-[var(--danger)] transition"><Icon.Trash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">
                Showing <span className="font-medium text-[var(--foreground)]">{students.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, students.length)}</span> of <span className="font-medium text-[var(--foreground)]">{students.length}</span> students
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon.ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isActive = p === safePage;
                    const nearActive = Math.abs(p - safePage) <= 1;
                    const isEdge = p === 1 || p === totalPages;
                    if (!nearActive && !isEdge) {
                      if (p === 2 && safePage > 3) return <span key={p} className="w-6 text-center text-xs text-[var(--muted-2)]">…</span>;
                      if (p === totalPages - 1 && safePage < totalPages - 2) return <span key={p} className="w-6 text-center text-xs text-[var(--muted-2)]">…</span>;
                      return null;
                    }
                    return <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-[2rem] px-2 rounded-lg text-xs font-medium transition ${isActive ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"}`}>{p}</button>;
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon.ChevronRight size={16} /></button>
                </div>
              )}
            </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Detail drawer */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailStudent(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-sm bg-[var(--surface)] h-full shadow-2xl flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <p className="font-semibold">Student details</p>
              <button onClick={() => setDetailStudent(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition"><Icon.X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-bold text-xl flex items-center justify-center shrink-0">{detailStudent.name.slice(0, 1).toUpperCase()}</div>
                <div>
                  <p className="text-lg font-bold">{detailStudent.name}</p>
                  <p className="text-sm text-[var(--muted)]">{detailStudent.email}</p>
                  {detailStudent.phone && <p className="text-sm text-[var(--muted)]">{detailStudent.phone}</p>}
                </div>
              </div>
              <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--muted)]">Profile</span><span>{isComplete(detailStudent) ? <Badge variant="success">Complete</Badge> : <Badge variant="warning">Incomplete</Badge>}</span></div>
                {detailStudent.education && detailStudent.education !== "None" && <div className="flex justify-between"><span className="text-[var(--muted)]">Education</span><span className="font-medium">{detailStudent.education}</span></div>}
                {detailStudent.createdAt && <div className="flex justify-between"><span className="text-[var(--muted)]">Joined</span><span className="font-medium">{new Date(detailStudent.createdAt).toLocaleDateString()}</span></div>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-center">
                  <p className="text-xl font-bold">{detailStudent.enrolledCount}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Enrolled</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-center">
                  <p className="text-xl font-bold">{detailStudent.completedCount}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Completed</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-center">
                  <p className="text-xl font-bold">{detailStudent.certificateCount}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Certs</p>
                </div>
              </div>
              {detailStudent.enrolledCount > 0 && detailStudent.completedCount > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Completion rate</p>
                  <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.round(detailStudent.completedCount / detailStudent.enrolledCount * 100)}%` }} />
                  </div>
                  <p className="text-xs text-right text-[var(--muted)]">{Math.round(detailStudent.completedCount / detailStudent.enrolledCount * 100)}%</p>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Button className="w-full" onClick={() => { startEdit(detailStudent); setDetailStudent(null); }}><Icon.FilePen size={15} /> Edit student</Button>
                <Button className="w-full" variant="outline" onClick={() => { startReset(detailStudent); setDetailStudent(null); }}><Icon.Lock size={15} /> Reset password</Button>
                <Button className="w-full" variant="ghost" onClick={() => { setConfirmDeleteId(detailStudent.id); setDetailStudent(null); }}><Icon.Trash size={15} /> Delete student</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateStudentModal open={mode === "create"} onClose={() => setMode(null)} onCreated={() => { setMode(null); refresh(); }} />
      <EditStudentModal open={mode === "edit"} student={editing} onClose={() => setMode(null)} onSaved={() => { setMode(null); refresh(); }} />
      <ResetPasswordModal open={mode === "reset"} student={editing} onClose={() => setMode(null)} onDone={() => setMode(null)} />

      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Delete student?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">This permanently removes the student account and clears their enrollments and certificates.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}><Icon.Trash size={15} /> Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title={`Delete ${selected.size} student${selected.size !== 1 ? "s" : ""}?`} size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">Permanently deletes <strong className="text-[var(--foreground)]">{selected.size} student account{selected.size !== 1 ? "s" : ""}</strong> and all their data.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkDelete}><Icon.Trash size={15} /> Delete all</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CreateStudentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void; }) {
  const admin = useAdmin(); const toast = useToast();
  const [name, setName] = React.useState(""); const [email, setEmail] = React.useState(""); const [password, setPassword] = React.useState(""); const [phone, setPhone] = React.useState(""); const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => { if (open) { setName(""); setEmail(""); setPassword(""); setPhone(""); setErr(null); } }, [open]);
  const phoneError = validatePhone(phone, false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    const fieldErr = validateName(name, "Full name") ?? validateEmail(email) ?? validatePassword(password) ?? phoneError;
    if (fieldErr) return setErr(fieldErr);
    const res = await admin.createStudent({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
    if (!res.ok) { setErr(res.error || "Couldn't create student."); return; }
    toast.push({ title: "Student account created", description: `${email} can now sign in.`, tone: "success" });
    onCreated();
  }
  return (
    <Modal open={open} onClose={onClose} title="Add student" size="md">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="s-name">Full name</Label><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" maxLength={60} /></div>
        <div><Label htmlFor="s-email">Email</Label><Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" icon={<Icon.Mail size={16} />} /></div>
        <div><Label htmlFor="s-password">Temporary password</Label><Input id="s-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" icon={<Icon.Lock size={16} />} maxLength={64} /></div>
        <div><Label htmlFor="s-phone">Phone (optional)</Label><Input id="s-phone" value={phone} onChange={(e) => setPhone(cleanPhoneInput(e.target.value))} placeholder="+92 300 1234567" inputMode="tel" error={phone ? phoneError : undefined} /></div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Icon.Plus size={16} /> Create account</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditStudentModal({ open, student, onClose, onSaved }: { open: boolean; student: StudentSummary | null; onClose: () => void; onSaved: () => void; }) {
  const admin = useAdmin(); const toast = useToast();
  const [name, setName] = React.useState(""); const [email, setEmail] = React.useState(""); const [phone, setPhone] = React.useState(""); const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => { if (open && student) { setName(student.name); setEmail(student.email); setPhone(student.phone ?? ""); setErr(null); } }, [open, student]);
  const phoneError = validatePhone(phone, false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!student) return; setErr(null);
    const fieldErr = validateName(name, "Full name") ?? validateEmail(email) ?? phoneError;
    if (fieldErr) return setErr(fieldErr);
    const res = await admin.updateStudent(student.id, { name: name.trim(), email: email.trim(), phone: phone.trim() });
    if (!res.ok) return setErr(res.error || "Couldn't save changes.");
    toast.push({ title: "Saved", tone: "success" }); onSaved();
  }
  return (
    <Modal open={open} onClose={onClose} title="Edit student" size="md">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="e-name">Full name</Label><Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></div>
        <div><Label htmlFor="e-email">Email</Label><Input id="e-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Icon.Mail size={16} />} /></div>
        <div><Label htmlFor="e-phone">Phone</Label><Input id="e-phone" value={phone} onChange={(e) => setPhone(cleanPhoneInput(e.target.value))} placeholder="+92 300 1234567" inputMode="tel" error={phone ? phoneError : undefined} /></div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ open, student, onClose, onDone }: { open: boolean; student: StudentSummary | null; onClose: () => void; onDone: () => void; }) {
  const admin = useAdmin(); const toast = useToast();
  const [password, setPassword] = React.useState(""); const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => { if (open) { setPassword(""); setErr(null); } }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!student) return; setErr(null);
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password.length > 64) return setErr("Password is too long (max 64 characters).");
    const res = await admin.resetStudentPassword(student.id, password);
    if (!res.ok) return setErr(res.error || "Couldn't reset password.");
    toast.push({ title: "Password reset", description: `Share the new password with ${student.email} securely.`, tone: "success" });
    onDone();
  }
  return (
    <Modal open={open} onClose={onClose} title={`Reset password${student ? ` — ${student.name}` : ""}`} size="sm">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="rp">New password</Label><Input id="rp" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" icon={<Icon.Lock size={16} />} /></div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Icon.Lock size={16} /> Set password</Button>
        </div>
      </form>
    </Modal>
  );
}
