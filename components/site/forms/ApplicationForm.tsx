"use client";

import { useState, type FormEvent } from "react";
import { validateEmail, validateLength, validateName } from "@/lib/validation";

type Kind = "contact" | "teach" | "affiliate";
type Errors = Partial<Record<"name" | "email" | "message" | "pitch", string>>;

const choices = {
  contact: ["General question", "Course suggestion", "Partnership", "Bug or feedback", "Press"],
  expertise: ["Programming", "Data Science", "Design", "Business", "Marketing", "Languages", "Other"],
  experience: ["< 1 year", "1-3 years", "3-7 years", "7+ years"],
  audience: ["Creator (video / podcast)", "Newsletter writer", "Blogger / SEO site", "Community / forum", "Educator", "Other"],
  size: ["< 1k", "1k - 10k", "10k - 100k", "100k - 1M", "1M+"],
};

// The original public forms acknowledge submissions locally; there is no public contact,
// instructor or affiliate application endpoint. /api/support requires a signed-in account
// and /api/applications accepts only in-person student course applications.
export default function ApplicationForm({ kind }: { kind: Kind }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const prefix = `edu-${kind}`;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const text = String(data.get(kind === "contact" ? "message" : "pitch") ?? "");
    const next: Errors = {};
    if (kind === "contact") {
      next.name = validateName(name, "Your name");
      next.email = validateEmail(email);
      next.message = validateLength(text, "Message", 10, 2000);
    } else {
      if (!name.trim()) next.name = "Please tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
      if (text.trim().length < (kind === "teach" ? 30 : 20)) {
        next.pitch = kind === "teach" ? "Pitch should be at least 30 characters." : "Tell us a bit more about your audience.";
      }
    }
    setErrors(next);
    setStatus("");
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    // Matches the original public pages' local acknowledgement (no backend submission).
    window.setTimeout(() => {
      form.reset();
      setSubmitting(false);
      setStatus(kind === "contact"
        ? "Message sent. Thanks — we'll be in touch shortly."
        : kind === "teach"
          ? "Application received. We'll review it and get back within 3–5 business days."
          : "Application received. We'll review and send your unique link within 2–3 days.");
    }, 800);
  }

  function field(name: "name" | "email", label: string, type = "text", placeholder = "") {
    const id = `${prefix}-${name}`;
    return (
      <div className="col-md-6">
        <label htmlFor={id} className="contact-three__input-title">{label}</label>
        <div className="contact-three__input-box">
          <input id={id} name={name} type={type} placeholder={placeholder} autoComplete={name} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-error` : undefined} />
          {errors[name] && <p id={`${id}-error`} className="edu-field-error" role="alert">{errors[name]}</p>}
        </div>
      </div>
    );
  }

  function select(name: "reason" | "expertise" | "experience" | "audience" | "size", label: string, options: string[], defaultValue?: string) {
    return (
      <div className={kind === "contact" ? "col-12" : "col-md-6"}>
        <label htmlFor={`${prefix}-${name}`} className="contact-three__input-title">{label}</label>
        <div className="contact-three__input-box">
          <select className="ignore edu-form-select" id={`${prefix}-${name}`} name={name} defaultValue={defaultValue ?? options[0]}>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-three__form edu-form" onSubmit={submit} noValidate>
      <div className="row">
        {field("name", "Your name", "text", "Jane Doe")}
        {field("email", "Email address", "email", "you@example.com")}
        {kind === "contact" && select("reason", "What's this about?", choices.contact)}
        {kind === "teach" && <>
          {select("expertise", "Area of expertise", choices.expertise)}
          {select("experience", "Years of experience", choices.experience, "1-3 years")}
        </>}
        {kind === "affiliate" && <>
          {select("audience", "Type of audience", choices.audience)}
          {select("size", "Audience size", choices.size, "1k - 10k")}
        </>}
        <div className="col-12">
          <label htmlFor={`${prefix}-text`} className="contact-three__input-title">
            {kind === "contact" ? "Message" : kind === "teach" ? "What would you teach, and for whom?" : "Tell us about your audience"}
          </label>
          <div className="contact-three__input-box text-message-box">
            <textarea id={`${prefix}-text`} name={kind === "contact" ? "message" : "pitch"} rows={6}
              placeholder={kind === "contact" ? "Tell us what's on your mind…" : kind === "teach" ? "e.g., A 6-hour intro to React for backend developers who already know JavaScript fundamentals…" : "What do you publish, who reads it, and how would you promote EduPortal?"}
              aria-invalid={!!errors[kind === "contact" ? "message" : "pitch"]}
              aria-describedby={errors[kind === "contact" ? "message" : "pitch"] ? `${prefix}-text-error` : undefined} />
          </div>
          {errors[kind === "contact" ? "message" : "pitch"] && <p id={`${prefix}-text-error`} className="edu-field-error" role="alert">{errors[kind === "contact" ? "message" : "pitch"]}</p>}
          <div className="edu-form-actions">
            <p>{kind === "contact" ? "By submitting, you agree to our friendly use of your email to reply." : kind === "teach" ? <>By applying you agree to our <a href="/terms">terms</a>.</> : <>You&apos;ll need to agree to our affiliate <a href="/terms">terms</a>.</>}</p>
            <div className="contact-three__btn-box">
              {/* One solid button like every other primary action; the template's pill + separate arrow circle read as two controls. */}
              <button type="submit" disabled={submitting} className="thm-btn contact-three__btn edu-submit">
                <span className="icon-angles-right" aria-hidden="true" />
                {submitting ? "Submitting…" : kind === "contact" ? "Send message" : kind === "teach" ? "Submit application" : "Apply"}
              </button>
            </div>
          </div>
          <div className="result edu-form-result" role="status" aria-live="polite">{status}</div>
        </div>
      </div>
    </form>
  );
}
