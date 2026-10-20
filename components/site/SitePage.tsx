"use client";

import { useTheme } from "@/lib/store";

type Props = {
  /** The theme the server rendered from the theme cookie. */
  dark: boolean;
  children: React.ReactNode;
};

// The site's root element. Server-rendered from the theme cookie; once the shared theme store knows
// the saved choice it decides instead, so a page React renders on the client never starts in the
// wrong theme. suppressHydrationWarning: with no cookie yet, the boot script in app/layout.tsx may
// add site-dark before React hydrates.
export default function SitePage({ dark, children }: Props) {
  const { theme, ready } = useTheme();
  const isDark = ready ? theme === "dark" : dark;

  return (
    <div className={isDark ? "site-page site-dark" : "site-page"} suppressHydrationWarning>
      {children}
    </div>
  );
}
