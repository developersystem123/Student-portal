"use client";

import { useState, type FormEvent } from "react";
import { RESET_TTL_MINUTES } from "@/lib/authConstants";
import { validateEmail } from "@/lib/validation";
import { SIGN_IN } from "../nav";
import AuthNotice from "./AuthNotice";
import { Field } from "./Field";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    setFormError("");
    if (emailError) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? "We couldn't send the reset email. Please try again.");
        return;
      }
      setSentTo(email.trim());
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <AuthNotice tone="success" title="Check your inbox">
        <p>
          If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent a link to reset the
          password. It expires in {RESET_TTL_MINUTES} minutes and can only be used once.
        </p>
        <p className="edu-auth__panel-note">
          Nothing after a few minutes? Check your spam folder, or make sure the address above is the
          one you signed up with.
        </p>
        <div className="edu-auth__panel-actions">
          <button
            type="button"
            className="thm-btn"
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
          >
            <span className="icon-angles-right" aria-hidden="true" />Use a different email
          </button>
        </div>
        <p className="edu-auth__panel-links">
          Remembered it? <a href={SIGN_IN}>Back to sign in</a>
        </p>
      </AuthNotice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="edu-forgot-title">
      <div className="row">
        <div className="col-xl-12">
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
          />
        </div>
        <div className="col-xl-12">
          <p className="edu-auth__hint">
            Enter the email on your account and we&apos;ll send you a link to choose a new password.
          </p>
        </div>
        {formError && (
          <div className="col-xl-12">
            <p className="edu-auth__alert" role="alert">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              {formError}
            </p>
          </div>
        )}
        <div className="col-xl-12">
          <div className="form-group edu-auth__submit">
            <button className="thm-btn" type="submit" disabled={loading} aria-busy={loading}>
              <span className="icon-angles-right" aria-hidden="true" />
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </div>
        </div>
      </div>

      <div className="create-account text-center">
        <p>
          Remembered your password? <a href={SIGN_IN}>Sign in here</a>
        </p>
      </div>
    </form>
  );
}
