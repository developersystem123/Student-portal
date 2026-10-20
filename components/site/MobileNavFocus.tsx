"use client";

// script.js opens and closes the mobile drawer by toggling `.expanded` on its wrapper. This adds the
// dialog behaviour on top: focus moves into the drawer and stays there, Escape closes it, and focus
// returns to the button that opened it.

import { useEffect } from "react";

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

export default function MobileNavFocus() {
  useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(".mobile-nav__wrapper");
    const content = wrapper?.querySelector<HTMLElement>(".mobile-nav__content");
    if (!wrapper || !content) return;

    let open = false;
    let opener: HTMLElement | null = null;
    let frame = 0;

    const isOpen = () => wrapper.classList.contains("expanded");
    // Skips links in collapsed groups (display: none).
    const focusables = () => [...content.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

    function close() {
      wrapper!.classList.remove("expanded");
      document.body.classList.remove("locked");
    }

    function sync() {
      if (isOpen() === open) return;
      open = isOpen();
      document.querySelectorAll(".main-menu .mobile-nav__toggler").forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));
      cancelAnimationFrame(frame);
      if (open) {
        // The panel turns visible only after its slide-in delay; keep trying until focus lands.
        const closeButton = content!.querySelector<HTMLElement>(".mobile-nav__close");
        let tries = 0;
        const focusClose = () => {
          closeButton?.focus();
          if (document.activeElement !== closeButton && ++tries < 120) frame = requestAnimationFrame(focusClose);
        };
        focusClose();
      } else {
        opener?.focus({ preventScroll: true });
        opener = null;
      }
    }

    // Safari doesn't focus buttons on click, so remember the opener from the click itself.
    function onClick(event: MouseEvent) {
      const toggle = event.target instanceof Element ? event.target.closest<HTMLElement>(".main-menu .mobile-nav__toggler") : null;
      if (toggle) opener = toggle;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!isOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (!content!.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const observer = new MutationObserver(sync);
    observer.observe(wrapper, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
