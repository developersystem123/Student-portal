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
  Textarea,
  useToast,
} from "@/components/ui";
import { useAdmin, type TeacherSummary } from "@/lib/store";
import { cleanPhoneInput, validateEmail, validateName, validatePassword, validatePhone } from "@/lib/validation";

type FormMode = "create" | "edit" | "reset" | null;
type SortKey = "name" | "courses" | "students";
type CourseFilter = "all" | "has-courses" | "no-courses";
const PAGE_SIZE = 10;

export default function AdminTeachersPage() {
  const admin = useAdmin();
  const toast = useToast();
  const [tick, setTick] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [courseFilter, setCourseFilter] = React.useState<CourseFilter>("all");
  const [page, setPage] = React.useState(1);
  const [mode, setMode] = React.useState<FormMode>(null);
  const [editing, setEditing] = React.useState<TeacherSummary | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [detailTeacher, setDetailTeacher] = React.useState<TeacherSummary | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const allTeachers = React.useMemo(() => admin.listTeachers(), [admin, tick]);

  const teachers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = allTeachers
      .filter((t) => courseFilter === "all" ? true : courseFilter === "has-courses" ? t.courseCount > 0 : t.courseCount === 0)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
    return [...base].sort((a, b) => {
      if (sortKey === "courses") return b.courseCount - a.courseCount;
      if (sortKey === "students") return b.studentCount - a.studentCount;
      return a.name.localeCompare(b.name);
    });
  }, [allTeachers, query, sortKey, courseFilter]);

  const stats = React.useMemo(() => ({
    total: allTeachers.length,
    totalCourses: allTeachers.reduce((s, t) => s + t.courseCount, 0),
    totalStudents: allTeachers.reduce((s, t) => s + t.studentCount, 0),
    withCourses: allTeachers.filter((t) => t.courseCount > 0).length,
  }), [allTeachers]);

  const activeFilters = (courseFilter !== "all" ? 1 : 0) + (query ? 1 : 0);
  function clearFilters() { setQuery(""); setCourseFilter("all"); setPage(1); }
  React.useEffect(() => { setPage(1); setSelected(new Set()); }, [query, sortKey, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(teachers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = teachers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allPageSelected = paginated.length > 0 && paginated.every((t) => selected.has(t.id));
  const somePageSelected = paginated.some((t) => selected.has(t.id));
  function toggleSelect(id: string) { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function togglePage() { setSelected((prev) => { const next = new Set(prev); if (allPageSelected) paginated.forEach((t) => next.delete(t.id)); else paginated.forEach((t) => next.add(t.id)); return next; }); }

  function refresh() { setTick((t) => t + 1); }

  function exportCsv() {
    const header = "Name,Email,Phone,Courses,Students\n";
    const csv = teachers.map((t) => [`"${t.name}"`, `"${t.email}"`, `"${t.phone ?? ""}"`, t.courseCount, t.studentCount].join(",")).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `teachers-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.push({ title: "Exported", tone: "success" });
  }

  async function handleBulkDelete() {
    await Promise.all(Array.from(selected).map((id) => admin.deleteTeacher(id)));
    toast.push({ title: `${selected.size} teacher${selected.size !== 1 ? "s" : ""} removed`, tone: "info" });
    setSelected(new Set()); setBulkDeleteOpen(false); refresh();
  }

  function startCreate() { setEditing(null); setMode("create"); }
  function startEdit(t: TeacherSummary) { setEditing(t); setMode("edit"); }
  function startReset(t: TeacherSummary) { setEditing(t); setMode("reset"); }
  function handleDelete(id: string) { admin.deleteTeacher(id); setConfirmDeleteId(null); toast.push({ title: "Teacher removed", tone: "success" }); refresh(); }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Manage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="mt-1 text-[var(--muted)]">Onboard instructors, edit details, reset passwords.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={teachers.length === 0}><Icon.Download size={16} /> Export CSV</Button>
          <Button onClick={startCreate}><Icon.Plus size={16} /> Add teacher</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total teachers", value: stats.total, icon: <Icon.Sparkles size={16} />, tint: "bg-[var(--primary-soft)] text-[var(--primary)]" },
          { label: "Active (with courses)", value: stats.withCourses, icon: <Icon.CheckCircle size={16} />, tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Courses taught", value: stats.totalCourses, icon: <Icon.Book size={16} />, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
          { label: "Students reached", value: stats.totalStudents, icon: <Icon.Users size={16} />, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
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
              {/* Course filter pills */}
              {(["all", "has-courses", "no-courses"] as CourseFilter[]).map((f) => (
                <button key={f} onClick={() => setCourseFilter(f)} className={`px-3 h-8 rounded-lg text-xs font-medium transition ${courseFilter === f ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                  {f === "all" ? "All teachers" : f === "has-courses" ? "Has courses" : "No courses"}
                </button>
              ))}
              <span className="text-xs text-[var(--muted)] shrink-0 ml-2">Sort:</span>
              {(["name", "courses", "students"] as SortKey[]).map((k) => (
                <button key={k} onClick={() => setSortKey(k)} className={`px-3 h-8 rounded-lg text-xs font-medium capitalize transition ${sortKey === k ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{k}</button>
              ))}
            </div>
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

          {teachers.length > 0 && (
            <p className="text-xs text-[var(--muted)]">{teachers.length === allTeachers.length ? `${allTeachers.length} teacher${allTeachers.length !== 1 ? "s" : ""}` : `${teachers.length} of ${allTeachers.length} teachers`}</p>
          )}

          {teachers.length === 0 ? (
            <EmptyState icon={<Icon.Sparkles size={20} />} title={activeFilters > 0 ? "No teachers match." : "No teachers yet."} description={activeFilters > 0 ? "Try clearing filters." : "Add your first teacher to get started."} action={activeFilters === 0 ? <Button onClick={startCreate}><Icon.Plus size={16} /> Add teacher</Button> : undefined} />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-2.5 px-3 w-10">
                      <input type="checkbox" checked={allPageSelected} ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }} onChange={togglePage} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" />
                    </th>
                    <th className="font-medium py-2.5 px-3">Teacher</th>
                    <th className="font-medium py-2.5 px-3 hidden md:table-cell">Phone</th>
                    <th className="font-medium py-2.5 px-3 hidden lg:table-cell">Bio</th>
                    <th className="font-medium py-2.5 px-3 text-center">Courses</th>
                    <th className="font-medium py-2.5 px-3 text-center hidden sm:table-cell">Students</th>
                    <th className="font-medium py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr key={t.id} className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 transition cursor-pointer ${selected.has(t.id) ? "bg-[var(--primary-soft)]/30" : ""}`} onClick={() => setDetailTeacher(t)}>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} className="h-4 w-4 accent-[var(--primary)] cursor-pointer" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-semibold inline-flex items-center justify-center text-sm shrink-0">{t.name.slice(0, 1).toUpperCase()}</div>
                          <div className="min-w-0"><p className="font-medium truncate">{t.name}</p><p className="text-xs text-[var(--muted)] truncate">{t.email}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-[var(--muted)] text-sm">{t.phone || "—"}</td>
                      <td className="py-3 px-3 hidden lg:table-cell text-xs text-[var(--muted)] max-w-[200px]">
                        <span className="line-clamp-1">{t.bio || "—"}</span>
                      </td>
                      <td className="py-3 px-3 text-center"><Badge variant="primary">{t.courseCount}</Badge></td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell"><Badge variant="default">{t.studentCount}</Badge></td>
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex gap-1">
                          <button onClick={() => startEdit(t)} title="Edit" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition"><Icon.FilePen size={14} /></button>
                          <button onClick={() => startReset(t)} title="Reset password" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition"><Icon.Lock size={14} /></button>
                          <button onClick={() => setConfirmDeleteId(t.id)} title="Delete" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-[var(--danger)] transition"><Icon.Trash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)] flex-wrap">
                <p className="text-sm text-[var(--muted)]">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, teachers.length)} of {teachers.length}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}><Icon.ChevronLeft size={16} /></Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1).reduce<(number | "…")[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(p); return acc; }, []).map((p, idx) => p === "…" ? <span key={`e-${idx}`} className="px-2 text-[var(--muted)] text-sm">…</span> : <button key={p} onClick={() => setPage(p as number)} className={`h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all ${safePage === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--surface-2)]"}`}>{p}</button>)}
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><Icon.ChevronRight size={16} /></Button>
                </div>
              </div>
            )}
            {totalPages <= 1 && teachers.length > 0 && (
              <p className="text-xs text-[var(--muted)] pt-1">Showing {teachers.length} of {allTeachers.length} teachers</p>
            )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Detail drawer */}
      {detailTeacher && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailTeacher(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-sm bg-[var(--surface)] h-full shadow-2xl flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <p className="font-semibold">Teacher details</p>
              <button onClick={() => setDetailTeacher(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition"><Icon.X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-bold text-xl flex items-center justify-center shrink-0">{detailTeacher.name.slice(0, 1).toUpperCase()}</div>
                <div>
                  <p className="text-lg font-bold">{detailTeacher.name}</p>
                  <p className="text-sm text-[var(--muted)]">{detailTeacher.email}</p>
                  {detailTeacher.phone && <p className="text-sm text-[var(--muted)]">{detailTeacher.phone}</p>}
                </div>
              </div>
              {detailTeacher.bio && (
                <div className="rounded-xl bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)] leading-relaxed">{detailTeacher.bio}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold">{detailTeacher.courseCount}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Courses</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-3 text-center">
                  <p className="text-2xl font-bold">{detailTeacher.studentCount}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Students</p>
                </div>
              </div>
              {detailTeacher.createdAt && (
                <p className="text-xs text-[var(--muted)]">Joined: {new Date(detailTeacher.createdAt).toLocaleDateString()}</p>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Button className="w-full" onClick={() => { startEdit(detailTeacher); setDetailTeacher(null); }}><Icon.FilePen size={15} /> Edit teacher</Button>
                <Button className="w-full" variant="outline" onClick={() => { startReset(detailTeacher); setDetailTeacher(null); }}><Icon.Lock size={15} /> Reset password</Button>
                <Button className="w-full" variant="ghost" onClick={() => { setConfirmDeleteId(detailTeacher.id); setDetailTeacher(null); }}><Icon.Trash size={15} /> Remove teacher</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TeacherFormModal open={mode === "create" || mode === "edit"} mode={mode === "edit" ? "edit" : "create"} teacher={mode === "edit" ? editing : null} onClose={() => setMode(null)} onSaved={() => { setMode(null); refresh(); }} />
      <ResetPasswordModal open={mode === "reset"} teacher={editing} onClose={() => setMode(null)} onDone={() => setMode(null)} />

      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Remove teacher?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">This deletes the teacher account. Their courses stay in the catalog but the instructor field will be set to &quot;Unassigned&quot;.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}><Icon.Trash size={15} /> Remove</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title={`Remove ${selected.size} teacher${selected.size !== 1 ? "s" : ""}?`} size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">Permanently removes <strong className="text-[var(--foreground)]">{selected.size} teacher account{selected.size !== 1 ? "s" : ""}</strong>.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBulkDelete}><Icon.Trash size={15} /> Remove all</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TeacherFormModal({ open, mode, teacher, onClose, onSaved }: { open: boolean; mode: "create" | "edit"; teacher: TeacherSummary | null; onClose: () => void; onSaved: () => void; }) {
  const admin = useAdmin(); const toast = useToast();
  const [name, setName] = React.useState(""); const [email, setEmail] = React.useState(""); const [password, setPassword] = React.useState(""); const [phone, setPhone] = React.useState(""); const [bio, setBio] = React.useState(""); const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => { if (!open) return; if (mode === "edit" && teacher) { setName(teacher.name); setEmail(teacher.email); setPhone(teacher.phone ?? ""); setBio(teacher.bio ?? ""); setPassword(""); } else { setName(""); setEmail(""); setPassword(""); setPhone(""); setBio(""); } setErr(null); }, [open, mode, teacher]);
  const phoneError = validatePhone(phone, false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    const fieldErr = validateName(name, "Full name") ?? validateEmail(email) ?? (mode === "create" ? validatePassword(password) : undefined) ?? phoneError;
    if (fieldErr) return setErr(fieldErr);
    if (bio.trim().length > 500) return setErr("Bio is too long (max 500 characters).");
    if (mode === "edit" && teacher) {
      const res = await admin.updateTeacher(teacher.id, { name: name.trim(), email: email.trim(), phone: phone.trim(), bio: bio.trim() });
      if (!res.ok) return setErr(res.error || "Couldn't save changes.");
      toast.push({ title: "Teacher updated", tone: "success" });
    } else {
      const res = await admin.createTeacher({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), bio: bio.trim() });
      if (!res.ok) return setErr(res.error || "Couldn't create teacher.");
      toast.push({ title: "Teacher account created", description: `${email} can now sign in.`, tone: "success" });
    }
    onSaved();
  }
  return (
    <Modal open={open} onClose={onClose} title={mode === "edit" ? "Edit teacher" : "Add teacher"} size="md">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="t-name">Full name</Label><Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" maxLength={60} /></div>
        <div><Label htmlFor="t-email">Email</Label><Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@example.com" icon={<Icon.Mail size={16} />} /></div>
        {mode === "create" && <div><Label htmlFor="t-password">Temporary password</Label><Input id="t-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" icon={<Icon.Lock size={16} />} maxLength={64} /></div>}
        <div><Label htmlFor="t-phone">Phone (optional)</Label><Input id="t-phone" value={phone} onChange={(e) => setPhone(cleanPhoneInput(e.target.value))} placeholder="+92 300 1234567" inputMode="tel" error={phone ? phoneError : undefined} /></div>
        <div><Label htmlFor="t-bio">Short bio (optional)</Label><Textarea id="t-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What they teach, expertise, etc." rows={3} /></div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{mode === "edit" ? "Save changes" : <><Icon.Plus size={16} /> Create teacher</>}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ open, teacher, onClose, onDone }: { open: boolean; teacher: TeacherSummary | null; onClose: () => void; onDone: () => void; }) {
  const admin = useAdmin(); const toast = useToast();
  const [password, setPassword] = React.useState(""); const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => { if (open) { setPassword(""); setErr(null); } }, [open]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!teacher) return; setErr(null);
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password.length > 64) return setErr("Password is too long (max 64 characters).");
    const res = await admin.resetTeacherPassword(teacher.id, password);
    if (!res.ok) return setErr(res.error || "Couldn't reset password.");
    toast.push({ title: "Password reset", description: `Share the new password with ${teacher.email} securely.`, tone: "success" });
    onDone();
  }
  return (
    <Modal open={open} onClose={onClose} title={`Reset password${teacher ? ` — ${teacher.name}` : ""}`} size="sm">
      <form onSubmit={submit} className="p-5 space-y-4">
        <div><Label htmlFor="trp">New password</Label><Input id="trp" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" icon={<Icon.Lock size={16} />} /></div>
        {err && <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Icon.Lock size={16} /> Set password</Button>
        </div>
      </form>
    </Modal>
  );
}
