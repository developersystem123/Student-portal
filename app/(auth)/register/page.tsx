"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input, Label, Select, useToast } from "@/components/ui";
import Icon from "@/components/icons";
import { useAuth } from "@/lib/store";
import { EDUCATION_LEVELS, type EducationLevel } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { cleanPhoneInput, validatePhone } from "@/lib/validation";

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

const strengthMeta = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-500" },
  { label: "Weak", color: "bg-red-500", text: "text-red-500" },
  { label: "Okay", color: "bg-amber-500", text: "text-amber-500" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" },
  { label: "Excellent", color: "bg-emerald-600", text: "text-emerald-600" },
];

const ROLES = [
  { value: "Student", label: "Student — Take courses & earn certificates" },
  { value: "Instructor", label: "Instructor — Create & teach courses" },
  { value: "Admin", label: "Admin — Manage the platform" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];

const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    if (user.role === "Admin") router.replace("/admin");
    else if (user.role === "Instructor") router.replace("/teacher");
    else router.replace("/dashboard");
  }, [user, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<RoleValue>("Student");
  const [education, setEducation] = useState<EducationLevel>("None");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwScore = useMemo(() => scorePassword(password), [password]);
  const pwMatch = password.length > 0 && password === confirm;
  const pwMismatch = confirm.length > 0 && password !== confirm;

  function validate() {
    const next: Record<string, string> = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2) next.name = "Please enter your full name (min 2 characters).";
    else if (trimmedName.length > 60) next.name = "Name is too long (max 60 characters).";
    else if (!NAME_RE.test(trimmedName))
      next.name = "Name can only contain letters, spaces, dots, hyphens and apostrophes.";

    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = "Email is required.";
    else if (!EMAIL_RE.test(trimmedEmail)) next.email = "Enter a valid email (e.g. you@example.com).";

    const phoneErr = validatePhone(phone);
    if (phoneErr) next.phone = phoneErr;

    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    else if (password.length > 64) next.password = "Password is too long (max 64).";

    if (!confirm) next.confirm = "Please confirm your password.";
    else if (password !== confirm) next.confirm = "Passwords don't match.";

    if (!agree) next.agree = "You must agree to the terms to continue.";
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      toast.push({ title: "Please fix the errors", description: "Check the highlighted fields.", tone: "danger" });
      return;
    }
    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role,
      education: role === "Student" ? education : undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setErrors({ form: res.error || "Registration failed." });
      toast.push({ title: "Couldn't sign up", description: res.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Account created!", description: "Welcome to EduPortal 🎉", tone: "success" });
    if (role === "Admin") router.replace("/admin");
    else if (role === "Instructor") router.replace("/teacher");
    else router.replace("/dashboard");
  }

  async function onGoogle() {
    setGLoading(true);
    await loginWithGoogle();
    setGLoading(false);
    router.replace("/dashboard");
  }

  const meta = strengthMeta[pwScore];

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-medium">
          <Icon.Sparkles size={12} /> Free forever
        </span>
        <h2 className="text-3xl sm:text-3xl font-bold leading-tight">
          Create your <span className="gradient-text">EduPortal</span> account
        </h2>
        {/* <p className="text-[var(--muted)] text-sm">
          Join thousands of learners. Personalized study plans, AI tutoring, and beautiful courses.
        </p> */}
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* Role dropdown — pick the kind of account to sign in as */}
        <div>
          <Label htmlFor="role">I&apos;m signing up as</Label>
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleValue)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          {/* <p className="mt-1.5 text-xs text-[var(--muted)]">
            Pick the role you want to log in with. You can have only one role per account.
          </p> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Icon.User size={16} />}
              error={errors.name}
              maxLength={60}
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Icon.Mail size={16} />}
              error={errors.email}
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={phone}
            onChange={(e) => setPhone(cleanPhoneInput(e.target.value))}
            error={errors.phone ?? (phone.trim() ? validatePhone(phone) : undefined)}
            inputMode="tel"
            autoComplete="tel"
          />
          {/* <p className="mt-1.5 text-xs text-[var(--muted)]">
            Between 10 and 15 digits. Optional leading +, spaces and hyphens are allowed.
          </p> */}
        </div>

        {role === "Student" && (
          <div className="fade-in">
            <Label htmlFor="education">Highest qualification</Label>
            <Select
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value as EducationLevel)}
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === "None" ? "Below Matriculation" : lvl}
                </option>
              ))}
            </Select>
            {/* <p className="mt-1.5 text-xs text-[var(--muted)]">
              Matriculation or above is required to apply for in-person classes.
            </p> */}
          </div>
        )}

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Icon.Lock size={16} />}
              error={errors.password}
              maxLength={64}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition"
              tabIndex={-1}
            >
              {showPw ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
            </button>
          </div>
          {password && (
            <div className="mt-2.5 space-y-1.5 fade-in">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i < pwScore ? meta.color : "bg-[var(--surface-2)]",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", meta.text)}>{meta.label}</span>
                <span className="text-[var(--muted-2)]">
                  Use 8+ chars with a number & symbol for &quot;Excellent&quot;
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              icon={<Icon.Lock size={16} />}
              error={errors.confirm}
              maxLength={64}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition"
              tabIndex={-1}
            >
              {showConfirm ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
            </button>
            {confirm.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {pwMatch ? (
                  <Icon.CheckCircle size={18} className="text-emerald-500" />
                ) : pwMismatch ? (
                  <Icon.X size={18} className="text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {pwMismatch && !errors.confirm && (
            <p className="mt-1.5 text-xs text-[var(--danger)]">Passwords don&apos;t match.</p>
          )}
        </div>

        <div className="rounded-xl bg-[var(--surface-2)] p-3.5">
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label={
              <span className="text-sm">
                I agree to the{" "}
                <a className="text-[var(--primary)] hover:underline font-medium cursor-pointer">Terms of Service</a> and{" "}
                <a className="text-[var(--primary)] hover:underline font-medium cursor-pointer">Privacy Policy</a>.
              </span>
            }
          />
          {errors.agree && <p className="mt-2 text-xs text-[var(--danger)] ml-7">{errors.agree}</p>}
        </div>

        {errors.form && (
          <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl flex items-center gap-2">
            <Icon.X size={16} /> {errors.form}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full h-12 text-base">
          {loading ? "Creating account…" : (
            <>
              Create account
              <Icon.ChevronRight size={16} />
            </>
          )}
        </Button>
      </form>

      <Button variant="outline" className="w-full h-11" onClick={onGoogle} loading={gLoading} type="button">
        <Icon.Google size={18} />
        Sign up with Google
      </Button>

      <p className="text-sm text-center text-[var(--muted)] pt-2 ">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
