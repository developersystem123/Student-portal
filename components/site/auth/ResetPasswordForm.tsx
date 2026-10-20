"use client";

import { useState, type FormEvent } from "react";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordStrengthLabel,
  scorePassword,
} from "@/lib/validation";
import { SIGN_IN } from "../nav";
import AuthNotice from "./AuthNotice";
import { PasswordField } from "./Field";

type Errors = { password?: string; confirm?: string; form?: string };

/** New password + confirmation, styled like the sign-up form. `token` comes from the emailed link. */
export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const score = scorePassword(password);
  const confirmStatus = !confirm ? undefined : password === confirm ? "match" : "mismatch";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (password.length < PASSWORD_MIN_LENGTH)
      next.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    else if (password.length > PASSWORD_MAX_LENGTH)
      next.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;

    if (!confirm) next.confirm = "Please confirm your new password.";
    else if (password !== confirm) next.confirm = "Passwords don't match.";

    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setErrors({ form: data.error ?? "We couldn't reset your password. Please try again." });
        return;
      }
      setDone(true);
    } catch {
      setErrors({ form: "We couldn't reach the server. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthNotice tone="success" title="Password updated">
        <p>Your password has been changed, and the reset link can no longer be used.</p>
        <div className="edu-auth__panel-actions">
          <a className="thm-btn" href={SIGN_IN}>
            <span className="icon-angles-right" aria-hidden="true" />Sign in
          </a>
        </div>
      </AuthNotice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="edu-reset-title">
      <div className="row">
        <div className="col-md-6">
          <PasswordField
            id="password"
            label="New password"
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          >
            {password && (
              <div className={`edu-auth__strength edu-auth__strength--${score}`}>
                <div className="edu-auth__strength-bars" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={i < score ? "is-on" : undefined} />
                  ))}
                </div>
                <p aria-live="polite">
                  Strength: <strong>{passwordStrengthLabel(score)}</strong>
                </p>
              </div>
            )}
          </PasswordField>
        </div>
        <div className="col-md-6">
          <PasswordField
            id="confirm"
            label="Confirm new password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            status={confirmStatus}
            error={errors.confirm ?? (confirmStatus === "mismatch" ? "Passwords don't match." : undefined)}
          />
        </div>
        {errors.form && (
          <div className="col-xl-12">
            <p className="edu-auth__alert" role="alert">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              {errors.form}
            </p>
          </div>
        )}
        <div className="col-xl-12">
          <div className="form-group edu-auth__submit">
            <button className="thm-btn" type="submit" disabled={loading} aria-busy={loading}>
              <span className="icon-angles-right" aria-hidden="true" />
              {loading ? "Saving…" : "Set new password"}
            </button>
          </div>
        </div>
      </div>

      <div className="create-account text-center">
        <p>
          <a href={SIGN_IN}>Back to sign in</a>
        </p>
      </div>
    </form>
  );
}
