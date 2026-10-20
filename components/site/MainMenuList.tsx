"use client";

// The header's link list. Client-side only to read the URL for the `current` item: script.js's own
// current-page check compares bare file names (about.html), which never matches the site's routes.
// script.js clones this list into the sticky header and the mobile menu after load, so it must stay
// plain markup — no React event handlers. The "More" disclosure is driven by document-level
// listeners instead, which reach every copy.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/icons";
import { MORE_MENU, NAV_LINKS, isActive } from "./nav";

const TOGGLE = ".edu-more__toggle";

function setOpen(toggle: Element, open: boolean) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.parentElement?.classList.toggle("is-open", open);
}

// The mobile drawer is an accordion: clicks and focus moving elsewhere in it shouldn't fold the group.
const inDrawer = (el: Element) => el.closest(".mobile-nav__content") !== null;

function useMoreMenu() {
  useEffect(() => {
    const openToggles = () => document.querySelectorAll(`${TOGGLE}[aria-expanded="true"]`);

    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const toggle = event.target.closest(TOGGLE);
      if (toggle) {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        openToggles().forEach((other) => other !== toggle && !inDrawer(other) && setOpen(other, false));
        toggle.parentElement?.classList.remove("is-dismissed");
        setOpen(toggle, open);
        return;
      }
      openToggles().forEach((other) => {
        if (!inDrawer(other) && !other.parentElement?.contains(event.target as Node)) setOpen(other, false);
      });
    }

    // Escape closes the panel even while it's only showing on hover, then returns focus to "More".
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".edu-more.is-open, .edu-more:hover").forEach((item) => {
        const toggle = item.querySelector(TOGGLE);
        if (!toggle || inDrawer(toggle)) return;
        const hadFocus = item.contains(document.activeElement);
        setOpen(toggle, false);
        item.classList.add("is-dismissed");
        if (hadFocus) (toggle as HTMLElement).focus();
      });
    }

    function onFocusOut(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const item = event.target.closest(".edu-more");
      const toggle = item?.querySelector(TOGGLE);
      if (!item || !toggle || inDrawer(toggle)) return;
      if (event.relatedTarget instanceof Node && item.contains(event.relatedTarget)) return;
      setOpen(toggle, false);
    }

    function onMouseOver(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      document.querySelectorAll(".edu-more.is-dismissed").forEach((item) => {
        if (!target || !item.contains(target)) item.classList.remove("is-dismissed");
      });
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("mouseover", onMouseOver);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);
}

export default function MainMenuList() {
  const pathname = usePathname();
  const moreActive = MORE_MENU.some((group) => group.items.some((item) => isActive(pathname, item.href)));
  useMoreMenu();

  return (
    <ul className="main-menu__list">
      {NAV_LINKS.map((link) => (
        <li key={link.href} className={isActive(pathname, link.href) ? "current" : undefined}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
      <li className={moreActive ? "dropdown edu-more current" : "dropdown edu-more"}>
        <button type="button" className="edu-more__toggle" aria-expanded="false">
          More
          <span className="edu-more__chevron" aria-hidden="true">
            <Icon.ChevronDown size={14} />
          </span>
        </button>
        {/* One <li> per group: the template styles every `li > a` as a menu row, on desktop and mobile. */}
        <ul className="shadow-box edu-more__menu">
          {MORE_MENU.map((group) => (
            <li key={group.title} className="edu-more__group">
              <p className="edu-more__heading">{group.title}</p>
              {group.items.map((item) => {
                const ItemIcon = Icon[item.icon];
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={isActive(pathname, item.href) ? "current" : undefined}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  >
                    <span className="edu-more__icon">
                      <ItemIcon size={16} aria-hidden="true" />
                    </span>
                    <span className="edu-more__text">
                      <span className="edu-more__label">{item.label}</span>
                      <span className="edu-more__description">{item.description}</span>
                    </span>
                  </a>
                );
              })}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}
