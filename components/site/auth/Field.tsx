/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Shown between the label and the input row, e.g. "Forgot password?". */
  aside?: ReactNode;
  /** id of extra descriptive text (strength meter, hint) to associate with the input. */
  describedBy?: string;
  /** Extra content after the input (strength meter, hints). */
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/** Builds the input's aria-describedby from the error id plus any extra description. */
function describedByFor(id: string, error: string | undefined, extra: string | undefined) {
  return [error ? `${id}-error` : null, extra].filter(Boolean).join(" ") || undefined;
}

/** A labelled template input (login.html / sign-up.html) with an inline error. */
export function Field({ id, label, error, aside, describedBy, children, ...input }: FieldProps) {
  return (
    <div className="form-group">
      <div className="edu-auth__label-row">
        <label className="edu-auth__label" htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="input-box">
        <input id={id} name={id} aria-invalid={!!error} aria-describedby={describedByFor(id, error, describedBy)} {...input} />
      </div>
      {error && <p id={`${id}-error`} className="edu-field-error" role="alert">{error}</p>}
      {children}
    </div>
  );
}

/** Password input with a show/hide toggle, as on the portal's sign-in page. */
export function PasswordField({ status, ...props }: Omit<FieldProps, "type"> & { status?: "match" | "mismatch" }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="form-group">
      <div className="edu-auth__label-row">
        <label className="edu-auth__label" htmlFor={props.id}>{props.label}</label>
        {props.aside}
      </div>
      <div className="input-box edu-auth__password">
        <input
          id={props.id}
          name={props.id}
          type={shown ? "text" : "password"}
          aria-invalid={!!props.error}
          aria-describedby={describedByFor(props.id, props.error, props.describedBy)}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
          autoComplete={props.autoComplete}
          maxLength={props.maxLength}
        />
        {status && <span className={`edu-auth__match edu-auth__match--${status}`} aria-hidden="true"><i className={status === "match" ? "fas fa-check" : "fas fa-times"} /></span>}
        <button type="button" className="edu-auth__reveal" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>
          <i className={shown ? "fas fa-eye-slash" : "fas fa-eye"} aria-hidden="true" />
        </button>
      </div>
      {props.error && <p id={`${props.id}-error`} className="edu-field-error" role="alert">{props.error}</p>}
      {props.children}
    </div>
  );
}

/** Template "Continue with Google" button — the portal's Google sign-in. */
export function GoogleButton({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <div className="google-facebook edu-auth__social">
      <button type="button" onClick={onClick} disabled={loading} aria-busy={loading}>
        <span className="icon"><img src="/site/assets/images/icon/icon-google-2.png" alt="" width={20} height={20} loading="lazy" decoding="async" /></span>
        {loading ? "Connecting to Google…" : label}
      </button>
    </div>
  );
}
