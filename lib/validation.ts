// Shared form-validation helpers. Every form in the app uses these so the
// rules — and the error messages — stay identical everywhere.
//
// Each `validate*` function returns an error string when the value is invalid,
// or `undefined` when it's fine.

// ---------- Phone numbers ----------
// Rule: 10–15 digits. Anything shorter or longer is rejected, and a number
// with more than 15 digits surfaces an explicit error (rather than silently
// truncating) so the user sees what went wrong.

export const PHONE_MIN_DIGITS = 10;
export const PHONE_MAX_DIGITS = 15;

// Strip characters a phone number can't contain. Capped at 20 chars so a user
// CAN type past 15 digits — that's what triggers the "too long" error.
export function cleanPhoneInput(raw: string): string {
  return raw.replace(/[^\d+\s-]/g, "").slice(0, 20);
}

// Count just the digits in a phone string.
export function phoneDigitCount(raw: string): number {
  return raw.replace(/\D/g, "").length;
}

export function validatePhone(raw: string, required = true): string | undefined {
  const v = (raw ?? "").trim();
  if (!v) return required ? "Phone number is required." : undefined;
  if (!/^\+?[\d\s-]+$/.test(v))
    return "Phone can only contain digits, spaces, hyphens and an optional leading +.";
  const digits = v.replace(/\D/g, "").length;
  if (digits < PHONE_MIN_DIGITS)
    return `Phone number must be at least ${PHONE_MIN_DIGITS} digits.`;
  if (digits > PHONE_MAX_DIGITS)
    return `Phone number cannot be more than ${PHONE_MAX_DIGITS} digits.`;
  return undefined;
}

// ---------- Email ----------
export function validateEmail(raw: string, required = true): string | undefined {
  const v = (raw ?? "").trim();
  if (!v) return required ? "Email is required." : undefined;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v))
    return "Enter a valid email address (e.g. you@example.com).";
  return undefined;
}

// ---------- Required / length ----------
export function validateRequired(raw: string, label = "This field"): string | undefined {
  return (raw ?? "").trim() ? undefined : `${label} is required.`;
}

export function validateLength(
  raw: string,
  label: string,
  min: number,
  max?: number,
  required = true,
): string | undefined {
  const v = (raw ?? "").trim();
  if (!v) return required ? `${label} is required.` : undefined;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (max !== undefined && v.length > max)
    return `${label} cannot be more than ${max} characters.`;
  return undefined;
}

// ---------- Person name ----------
// Letters, spaces, dots, hyphens and apostrophes only.
export function validateName(raw: string, label = "Name"): string | undefined {
  const v = (raw ?? "").trim();
  if (!v) return `${label} is required.`;
  if (v.length < 3) return `${label} must be at least 3 characters.`;
  if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(v))
    return `${label} can only contain letters, spaces, dots, hyphens and apostrophes.`;
  return undefined;
}

// ---------- Safe post-auth redirect ----------
// Guards the `?next=` value carried through sign-in / sign-up. Only same-site absolute paths are
// allowed, so the value can never bounce a freshly authenticated user to another origin
// (open redirect). Rejects protocol-relative ("//evil.com"), absolute URLs ("https://…"),
// backslashes and control characters.
export function safeNextPath(raw: string | null | undefined): string | undefined {
  const v = (raw ?? "").trim();
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return undefined;
  if (v.includes("://") || /[\x00-\x1f]/.test(v)) return undefined;
  return v;
}

// ---------- Password ----------
export function validatePassword(raw: string, min = 6): string | undefined {
  if (!raw) return "Password is required.";
  if (raw.length < min) return `Password must be at least ${min} characters.`;
  return undefined;
}

/** Password rules shared by sign-up and the reset form. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

// ---------- Password strength ----------
// 0–4, driving the four-segment meter on the sign-up and password-reset forms.
const STRENGTH_LABELS = ["Too weak", "Weak", "Okay", "Strong", "Excellent"] as const;

export function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function passwordStrengthLabel(score: number): string {
  return STRENGTH_LABELS[Math.max(0, Math.min(score, 4))];
}

// ---------- Whole-number field ----------
export function validateNumber(
  raw: string | number,
  label: string,
  opts: { min?: number; max?: number; integer?: boolean; required?: boolean } = {},
): string | undefined {
  const { min, max, integer, required = true } = opts;
  const str = String(raw ?? "").trim();
  if (!str) return required ? `${label} is required.` : undefined;
  const n = Number(str);
  if (!Number.isFinite(n)) return `${label} must be a valid number.`;
  if (integer && !Number.isInteger(n)) return `${label} must be a whole number.`;
  if (min !== undefined && n < min) return `${label} must be at least ${min}.`;
  if (max !== undefined && n > max) return `${label} cannot be more than ${max}.`;
  return undefined;
}

// True when every value in the record is `undefined` (i.e. no errors).
export function isClean(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every((e) => !e);
}
