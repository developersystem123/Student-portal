"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input, Label, useToast } from "@/components/ui";
import Icon from "@/components/icons";
import { useAuth } from "@/lib/store";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    if (user.role === "Admin") router.replace("/admin");
    else if (user.role === "Instructor") router.replace("/teacher");
    else router.replace("/dashboard");
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setErrors({ form: res.error });
      toast.push({ title: "Sign in failed", description: res.error, tone: "danger" });
      return;
    }
    toast.push({ title: "Welcome back!", tone: "success" });
    // role-based redirect handled by the user-watching effect above
  }

  async function onGoogle() {
    setGLoading(true);
    await loginWithGoogle();
    setGLoading(false);
    // role-based redirect handled by the user-watching effect above
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-[var(--muted)] text-sm">Sign in to continue your learning journey.</p>
      </div>
     
      <form onSubmit={onSubmit} className="space-y-4">
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
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs text-[var(--primary)] hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Icon.Lock size={16} />}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {show ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
        </div>

        {errors.form && (
          <p className="text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {errors.form}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full h-11">
          Sign in
        </Button>
      </form>

      <Button variant="outline" className="w-full h-11" onClick={onGoogle} loading={gLoading} type="button">
        <Icon.Google size={18} />
        Continue with Google
      </Button>

      {/* <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        OR
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div> */}

      <p className="text-sm text-center text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
          Create one
        </Link>
      </p>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] p-3 text-xs text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)] mb-1">Demo accounts</p>
        <p>Student: student@demo.com / demo1234</p>
        <p>Instructor: teacher@demo.com / demo1234</p>
        <p>Admin: admin@demo.com / demo1234</p>
      </div>
    </div>
  );
}
