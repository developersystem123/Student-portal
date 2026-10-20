"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The panel that replaces an auth form once it has done its job ("check your email", "password
 * updated", "this link has expired"). Taking focus on mount is what makes a screen reader
 * announce it — the form it replaces just disappears.
 */
export default function AuthNotice({
  tone,
  title,
  children,
}: {
  tone: "success" | "error";
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className={`edu-auth__panel edu-auth__panel--${tone}`}
    >
      <span className="edu-auth__panel-icon" aria-hidden="true">
        <i className={`fas ${tone === "success" ? "fa-check" : "fa-exclamation"}`} />
      </span>
      {/* The page's own heading is the h1, so the panel is the next level down. */}
      <h2 className="edu-auth__panel-title">{title}</h2>
      {children}
    </div>
  );
}
