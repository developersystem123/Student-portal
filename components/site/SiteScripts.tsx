"use client";

import { useEffect } from "react";

const JS = "/site/assets/js/";

// All ~20 template vendor libraries (jQuery, Bootstrap, Owl, GSAP…) are concatenated, in their exact
// load order, into one file by scripts/build-site-js.mjs — a single request instead of ~20.
const VENDOR_BUNDLE = `${JS}site-vendor.js`;

type JQueryish = (target: Window) => { trigger: (event: string) => void };

// Vendor libraries are global and only need to load once per document.
let vendorReady: Promise<void> | null = null;

// Owl carousel renders its prev/next arrows as unlabelled `<button role="presentation">` and keeps
// loop clones of every slide in the DOM. That leaves screen-reader and keyboard users with nameless
// controls and duplicated, focusable slides — so we patch the markup the plugin emits, at runtime.
function makeCarouselsAccessible(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>(".owl-prev, .owl-next").forEach((btn) => {
    if (btn.getAttribute("aria-label")) return;
    btn.removeAttribute("role");
    btn.setAttribute("aria-label", btn.classList.contains("owl-prev") ? "Previous slide" : "Next slide");
    const glyph = btn.querySelector("span, i");
    if (glyph) glyph.setAttribute("aria-hidden", "true");
  });
  root.querySelectorAll<HTMLElement>(".owl-dots").forEach((dots) => {
    dots.querySelectorAll<HTMLButtonElement>(":scope > .owl-dot").forEach((dot, i) => {
      if (!dot.getAttribute("aria-label")) dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    });
  });
  root.querySelectorAll<HTMLElement>(".owl-item.cloned").forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]").forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
  });
  root.querySelectorAll<HTMLElement>(".owl-item").forEach(fenceSlide);
}

// Owl marks the slides in view with .active. The rest sit off the clipped stage; tabbing into them makes
// the browser scroll the stage and knocks the carousel out of position, so they stay inert until shown.
function fenceSlide(item: HTMLElement) {
  item.inert = !item.classList.contains("active");
}

// Carousels can be (re)initialised after the first pass, and every slide change moves .active —
// keep the fix applied to new markup and to the slides coming into view.
function watchForCarousels() {
  if (!("MutationObserver" in window)) return null;
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes") {
        if (m.target instanceof HTMLElement && m.target.classList.contains("owl-item")) fenceSlide(m.target);
        continue;
      }
      for (const node of m.addedNodes) if (node instanceof Element) makeCarouselsAccessible(node);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  return observer;
}

// async=false makes dynamically inserted scripts download in parallel but execute in insertion order.
function appendScript(src: string) {
  const el = document.createElement("script");
  el.src = src;
  el.async = false;
  const loaded = new Promise<void>((resolve, reject) => {
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
  });
  document.body.appendChild(el);
  return { el, loaded };
}

export default function SiteScripts() {
  useEffect(() => {
    let cancelled = false;
    let templateScript: HTMLScriptElement | null = null;
    let carouselObserver: MutationObserver | null = null;

    // The template's custom cursor only activates when <body> carries this class. It trails the pointer
    // with an animated ring, so it's skipped on touch screens and for visitors who ask for reduced motion.
    if (window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
      document.body.classList.add("custom-cursor");
    }

    vendorReady ??= appendScript(VENDOR_BUNDLE).loaded.then(() => undefined);

    vendorReady
      .then(async () => {
        if (cancelled) return;
        // script.js runs on every mount so it binds to this page's fresh DOM.
        const { el, loaded } = appendScript(JS + "script.js");
        templateScript = el;
        await loaded;
        if (cancelled) return;
        const w = window as unknown as { jQuery: JQueryish; Odometer?: { init: () => void } };
        // odometer.js only auto-initialises on DOMContentLoaded, which has passed by now.
        w.Odometer?.init();
        // window "load" may also have fired already — replay it so load-time widgets initialise
        // exactly as on a full page load.
        if (document.readyState === "complete") w.jQuery(window).trigger("load");
        // Label the carousel controls and fence off loop clones now that the template has built them.
        makeCarouselsAccessible(document);
        carouselObserver = watchForCarousels();
      })
      .catch((err) => console.error("[site]", err));

    return () => {
      cancelled = true;
      carouselObserver?.disconnect();
      templateScript?.remove();
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  return null;
}
