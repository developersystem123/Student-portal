"use client";

import { useState, type FormEvent } from "react";
import { validateEmail } from "@/lib/validation";

// Footer newsletter subscribe form (SiteFooter.tsx). The template's original form had no name or
// label and did a plain submit (full page reload, no feedback). This brings it in line with the
// other public site forms: client-side validation + an accessible label + an inline
// success/error message, with no navigation. Like the other public forms (ApplicationForm.tsx)
// there is no public newsletter endpoint, so a valid submission is acknowledged locally.
export default function NewsletterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    const nextError = validateEmail(email) ?? "";
    setError(nextError);
    setStatus("");
    if (nextError) return;

    setSubmitting(true);
    window.setTimeout(() => {
      form.reset();
      setSubmitting(false);
      setStatus("You're subscribed! Study tips and course updates are on the way.");
    }, 600);
  }

  return (
    <form className="site-footer__newsletter-form" onSubmit={submit} noValidate>
      <label className="edu-sr-only" htmlFor="edu-newsletter-email">Email address</label>
      <div className="site-footer__newsletter-input">
        <input
          id="edu-newsletter-email"
          name="email"
          type="email"
          placeholder="Enter Your Email"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? "edu-newsletter-email-error" : status ? "edu-newsletter-email-status" : undefined}
        />
      </div>
      <button type="submit" className="thm-btn" disabled={submitting}>
        <span className="icon-angles-right" aria-hidden="true" />
        {" "}{submitting ? "Subscribing…" : "Subscribe"}
      </button>
      {error && (
        <p id="edu-newsletter-email-error" className="site-footer__newsletter-msg edu-newsletter-error" role="alert">{error}</p>
      )}
      <p id="edu-newsletter-email-status" className="site-footer__newsletter-msg edu-newsletter-success" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
