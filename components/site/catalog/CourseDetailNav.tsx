"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The four course-detail sections, in page order.
const TABS = [
  { id: "overview", label: "Overview", icon: "icon-pen-ruler" },
  { id: "curriculum", label: "Curriculum", icon: "icon-book" },
  { id: "instructor", label: "Instructor", icon: "icon-graduation-cap" },
  { id: "review", label: "Reviews", icon: "icon-comments" },
];

// A tab strip that shows which section you are reading. The template drew these as four identical
// links with no current state, so there was no way to tell where you were on a long page.
export default function CourseDetailNav() {
  const [active, setActive] = useState(TABS[0].id);
  const navRef = useRef<HTMLElement | null>(null);

  // The section whose top has most recently passed the reading line (a fifth of the way down the
  // viewport) is the one being read; the last section wins once the page is scrolled to the end.
  const sync = useCallback(() => {
    const panels = TABS.map(tab => document.getElementById(tab.id)).filter((el): el is HTMLElement => !!el);
    if (!panels.length) return;
    const line = window.innerHeight * 0.25;
    let current = panels[0].id;
    for (const panel of panels) if (panel.getBoundingClientRect().top <= line) current = panel.id;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = panels[panels.length - 1].id;
    setActive(current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => { frame = 0; sync(); });
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sync]);

  // Keep the current tab visible when the strip scrolls sideways on narrow screens. Only the strip
  // itself moves — scrollIntoView on the link would drag the whole page back to the tab row.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: Math.max(0, link.offsetLeft - (nav.clientWidth - link.clientWidth) / 2), behavior: reduced ? "auto" : "smooth" });
  }, [active]);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const panel = document.getElementById(id);
    if (!panel) return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActive(id);
    // Moving focus is what makes the jump announced rather than a silent visual change.
    panel.setAttribute("tabindex", "-1");
    panel.focus({ preventScroll: true });
  };

  return (
    <nav className="edu-detail__nav" aria-label="Course information" ref={navRef}>
      {TABS.map(tab => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          aria-current={active === tab.id ? "true" : undefined}
          onClick={event => go(event, tab.id)}
        >
          <span className={tab.icon} aria-hidden="true" /> {tab.label}
        </a>
      ))}
    </nav>
  );
}
