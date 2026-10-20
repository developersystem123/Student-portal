// One light/dark choice for the whole product. The public site renders it on the server from the
// cookie and the portal reads the same cookie on the client, so switching in either place carries
// over to the other. localStorage keeps a copy: it holds choices saved before the two were joined,
// and its `storage` event keeps other open tabs in step.

export type Theme = "light" | "dark";

export const THEME_COOKIE = "site-theme";
export const THEME_STORAGE_KEY = "eduportal:theme";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The saved choice — cookie first, then the older localStorage copy — or null if there is none. */
export function readSavedTheme(): Theme | null {
  try {
    const cookie = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))?.[1];
    if (isTheme(cookie)) return cookie;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** The saved choice, or the device's preference when nothing has been saved yet. */
export function resolveTheme(): Theme {
  const saved = readSavedTheme();
  if (saved) return saved;
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled — the cookie alone still carries the choice.
  }
}

/**
 * Inline, pre-paint version of resolveTheme() for <script> tags (no imports available there).
 * Evaluates to "light" or "dark".
 */
export const RESOLVE_THEME_JS = `(function(){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/),t=m&&m[1];
if(t!=="dark"&&t!=="light")try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}
if(t!=="dark"&&t!=="light")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
return t})()`;
