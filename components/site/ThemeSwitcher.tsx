"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/store";

// Handles every [data-site-theme-toggle] on the page, including the sticky-header copy that
// script.js makes. The choice goes through the portal's theme store, so the site and the
// dashboard always share one light/dark setting (see lib/theme.ts).
export default function ThemeSwitcher() {
  const { theme, ready, setTheme } = useTheme();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const toggle = (event.target as Element | null)?.closest?.("[data-site-theme-toggle]");
      const page = document.querySelector(".site-page");
      if (!toggle || !page) return;
      setTheme(page.classList.contains("site-dark") ? "light" : "dark");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [setTheme]);

  // SitePage paints the page from the store; keep every toggle's state in step with it, including
  // the sticky-header copy React doesn't know about.
  useEffect(() => {
    if (!ready) return;
    const dark = theme === "dark";
    document
      .querySelectorAll("[data-site-theme-toggle]")
      .forEach((el) => el.setAttribute("aria-checked", String(dark)));
  }, [theme, ready]);

  return null;
}
