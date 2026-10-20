"use client";

import { useEffect, useRef } from "react";

export default function SearchPopup() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const previousOverflow = useRef<string | null>(null);

  function restorePage() {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
    document.querySelectorAll(".edu-search-trigger").forEach((button) => button.setAttribute("aria-expanded", "false"));
    opener.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    // Delegate so the template's cloned sticky-header button works too.
    function openSearch(event: MouseEvent) {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>(".edu-search-trigger") : null;
      if (!button || !dialog.current || dialog.current.open) return;
      opener.current = button;
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.current.showModal();
      document.querySelectorAll(".edu-search-trigger").forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));
      input.current?.focus();
    }
    document.addEventListener("click", openSearch);
    return () => {
      document.removeEventListener("click", openSearch);
      if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      id="edu-course-search-dialog"
      className="edu-search-dialog"
      aria-labelledby="edu-search-title"
      aria-describedby="edu-search-help"
      onClose={restorePage}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>("button, input");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
      }}
    >
      <div className="edu-search-dialog__header">
        <h2 id="edu-search-title">Find your next course</h2>
        <button type="button" className="edu-search-dialog__close" aria-label="Close search" onClick={() => dialog.current?.close()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
      </div>
      <p id="edu-search-help">Search by course title to find what you want to learn.</p>
      <form method="get" action="/courses">
        <label htmlFor="edu-course-search-input">Course title</label>
        <div className="edu-search-dialog__field">
          <input ref={input} id="edu-course-search-input" type="search" name="q" placeholder="e.g. Web development" autoComplete="off" required />
          <button type="submit" className="edu-search-dialog__submit">Search</button>
        </div>
      </form>
    </dialog>
  );
}
