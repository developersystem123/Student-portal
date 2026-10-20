"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/store";
import { validateEmail, validatePassword } from "@/lib/validation";
import { FORGOT_PASSWORD, PORTAL_HOME, SIGN_UP } from "../nav";
import { Field, GoogleButton, PasswordField } from "./Field";

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@demo.com" },
  { role: "Instructor", email: "teacher@demo.com" },
  { role: "Admin", email: "admin@demo.com" },
];
const DEMO_PASSWORD = "demo1234";

// The credentials box is a development convenience. It is hidden from production builds unless
// NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=1 is set deliberately (e.g. a public portfolio demo).
const SHOW_DEMO_ACCOUNTS =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "1";

type Errors = { email?: string; password?: string; form?: string };

export default function LoginForm({ next }: { next?: string }) {
  const { user, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Back to wherever they were headed (e.g. the course they were enrolling in), else the same
  // role-based landing as the portal's sign-in page. A full page load, so none of the template's
  // global CSS/JS follows the user into the portal.
  useEffect(() => {
    if (signedIn && user) window.location.assign(next ?? PORTAL_HOME[user.role]);
  }, [signedIn, user, next]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    const res = await login(email.trim(), password, remember);
    if (!res.ok) {
      setLoading(false);
      setErrors({ form: res.error ?? "Sign in failed. Please try again." });
      return;
    }
    setSignedIn(true);
  }

  async function onGoogle() {
    setGoogleLoading(true);
    setSignedIn(true);
    await loginWithGoogle();
    setGoogleLoading(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="edu-login-title">
      <div className="row">
        <div className="col-xl-12">
          <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        </div>
        <div className="col-xl-12">
          <PasswordField
            id="password"
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            aside={<a className="edu-auth__forgot" href={FORGOT_PASSWORD}>Forgot password?</a>}
          />
        </div>
        <div className="col-xl-12">
          <div className="remember-forget">
            <div className="checked-box1">
              <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <label htmlFor="remember"><span />Remember me</label>
            </div>
          </div>
        </div>
        {errors.form && <div className="col-xl-12"><p className="edu-auth__alert" role="alert"><i className="fas fa-exclamation-circle" aria-hidden="true" />{errors.form}</p></div>}
        <div className="col-xl-12">
          <div className="form-group edu-auth__submit">
            <button className="thm-btn" type="submit" disabled={loading} aria-busy={loading}>
              <span className="icon-angles-right" />{loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      <p className="edu-auth__divider"><span>or</span></p>
      <GoogleButton label="Continue with Google" loading={googleLoading} onClick={onGoogle} />

      <div className="create-account text-center">
        <p>Don&apos;t have an account? <a href={next ? `${SIGN_UP}?next=${encodeURIComponent(next)}` : SIGN_UP}>Create one</a></p>
      </div>

      {SHOW_DEMO_ACCOUNTS && (
      <div className="edu-auth__demo" role="group" aria-labelledby="edu-demo-title">
        <p className="edu-auth__demo-title" id="edu-demo-title">Try a demo account</p>
        <div className="edu-auth__demo-roles">
          {DEMO_ACCOUNTS.map((account) => (
            <button key={account.role} type="button" onClick={() => { setEmail(account.email); setPassword(DEMO_PASSWORD); setErrors({}); }}>
              <span className="edu-auth__demo-role">{account.role}</span>
              <span className="edu-auth__demo-email">{account.email}</span>
            </button>
          ))}
        </div>
        <p className="edu-auth__demo-note">Picking one fills in the email and password above.</p>
      </div>
      )}
    </form>
  );
}
