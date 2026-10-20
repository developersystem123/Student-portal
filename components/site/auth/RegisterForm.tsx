"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth, type Role } from "@/lib/store";
import { EDUCATION_LEVELS, type EducationLevel } from "@/lib/mockData";
import { cleanPhoneInput, passwordStrengthLabel, scorePassword, validatePhone } from "@/lib/validation";
import { PORTAL_HOME, SIGN_IN } from "../nav";
import { Field, GoogleButton, PasswordField } from "./Field";

// Same choices, rules and messages as the portal's own sign-up page.
const ROLES: { value: Role; label: string }[] = [
  { value: "Student", label: "Student — Take courses & earn certificates" },
  { value: "Instructor", label: "Instructor — Create & teach courses" },
];
const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

type Errors = Partial<Record<"name" | "email" | "phone" | "password" | "confirm" | "agree" | "form", string>>;

export default function RegisterForm({ next }: { next?: string }) {
  const { user, register, loginWithGoogle } = useAuth();
  const [role, setRole] = useState<Role>("Student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState<EducationLevel>("None");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  // Fields whose live validation should be shown yet. Errors set by a submit attempt always show;
  // the ones computed as you type wait until the field has been left, so they are announced on blur
  // rather than on every keystroke.
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});

  // Back to wherever they were headed (e.g. the course they were enrolling in), else a full page
  // load into the new account's portal, like the sign-in page.
  useEffect(() => {
    if (signedIn && user) window.location.assign(next ?? PORTAL_HOME[user.role]);
  }, [signedIn, user, next]);

  const score = scorePassword(password);
  const confirmStatus = !confirm ? undefined : password === confirm ? "match" : "mismatch";

  function validate(): Errors {
    const next: Errors = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2) next.name = "Please enter your full name (min 2 characters).";
    else if (trimmedName.length > 60) next.name = "Name is too long (max 60 characters).";
    else if (!NAME_RE.test(trimmedName)) next.name = "Name can only contain letters, spaces, dots, hyphens and apostrophes.";

    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = "Email is required.";
    else if (!EMAIL_RE.test(trimmedEmail)) next.email = "Enter a valid email (e.g. you@example.com).";

    next.phone = validatePhone(phone);

    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    else if (password.length > 64) next.password = "Password is too long (max 64).";

    if (!confirm) next.confirm = "Please confirm your password.";
    else if (password !== confirm) next.confirm = "Passwords don't match.";

    if (!agree) next.agree = "You must agree to the terms to continue.";
    return next;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    // Errors are added in form order and keyed by input id. Focus by id, since aria-invalid
    // isn't rendered until after this handler returns.
    const firstInvalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      // Take keyboard and screen-reader users straight to the first problem.
      document.getElementById(firstInvalid)?.focus();
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
    if (!res.ok) {
      setLoading(false);
      setErrors({ form: res.error || "Registration failed." });
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
    <form onSubmit={onSubmit} noValidate aria-labelledby="edu-register-title">
      <div className="row">
        <div className="col-xl-12">
          <div className="form-group">
            <div className="edu-auth__label-row"><label className="edu-auth__label" htmlFor="role">I&apos;m signing up as</label></div>
            <div className="input-box edu-auth__select">
              <select className="ignore" id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <Field id="name" label="Full name" type="text" placeholder="Aarav Sharma" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        </div>
        <div className="col-md-6">
          <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        </div>
        <div className={role === "Student" ? "col-md-6" : "col-xl-12"}>
          <Field id="phone" label="Phone number" type="tel" inputMode="tel" placeholder="+92 300 1234567" autoComplete="tel" value={phone} onChange={(e) => setPhone(cleanPhoneInput(e.target.value))} onBlur={() => setBlurred((b) => ({ ...b, phone: true }))} error={errors.phone ?? (blurred.phone && phone.trim() ? validatePhone(phone) : undefined)} />
        </div>
        {role === "Student" && (
          <div className="col-md-6">
            <div className="form-group">
              <div className="edu-auth__label-row"><label className="edu-auth__label" htmlFor="education">Highest qualification</label></div>
              <div className="input-box edu-auth__select">
                <select className="ignore" id="education" name="education" value={education} onChange={(e) => setEducation(e.target.value as EducationLevel)}>
                  {EDUCATION_LEVELS.map((level) => <option key={level} value={level}>{level === "None" ? "Below Matriculation" : level}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="col-md-6">
          <PasswordField id="password" label="Password" describedBy={password ? "edu-password-strength" : undefined} placeholder="At least 8 characters" autoComplete="new-password" maxLength={64} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password}>
            {password && (
              <div className={`edu-auth__strength edu-auth__strength--${score}`}>
                <div className="edu-auth__strength-bars" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} className={i < score ? "is-on" : undefined} />)}</div>
                {/* No aria-live: it changed on every keystroke and interrupted the screen reader.
                    It is instead described-by the input, so it is read when the field is focused. */}
                <p id="edu-password-strength">Strength: <strong>{passwordStrengthLabel(score)}</strong></p>
              </div>
            )}
          </PasswordField>
        </div>
        <div className="col-md-6">
          <PasswordField id="confirm" label="Confirm password" placeholder="Re-enter password" autoComplete="new-password" maxLength={64} value={confirm} onChange={(e) => setConfirm(e.target.value)} onBlur={() => setBlurred((b) => ({ ...b, confirm: true }))} status={confirmStatus} error={errors.confirm ?? (blurred.confirm && confirmStatus === "mismatch" ? "Passwords don't match." : undefined)} />
        </div>
        <div className="col-xl-12">
          <div className="checked-box1 edu-auth__terms">
            <input type="checkbox" id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!errors.agree} aria-describedby={errors.agree ? "agree-error" : undefined} />
            <label htmlFor="agree"><span />I agree to the <a href={`/terms`}>Terms of Service</a> and <a href={`/privacy`}>Privacy Policy</a>.</label>
            {errors.agree && <p id="agree-error" className="edu-field-error" role="alert">{errors.agree}</p>}
          </div>
        </div>
        {errors.form && <div className="col-xl-12"><p className="edu-auth__alert" role="alert"><i className="fas fa-exclamation-circle" aria-hidden="true" />{errors.form}</p></div>}
        <div className="col-xl-12">
          <div className="form-group edu-auth__submit">
            <button className="thm-btn" type="submit" disabled={loading} aria-busy={loading}>
              <span className="icon-angles-right" />{loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </div>
      </div>

      <p className="edu-auth__divider"><span>or</span></p>
      <GoogleButton label="Sign up with Google" loading={googleLoading} onClick={onGoogle} />

      <div className="create-account text-center">
        <p>Already have an account? <a href={next ? `${SIGN_IN}?next=${encodeURIComponent(next)}` : SIGN_IN}>Sign in here</a></p>
      </div>
    </form>
  );
}
