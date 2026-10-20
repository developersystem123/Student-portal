"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icons";
import { NavLinkIcon } from "./NavLinkIcon";
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: (p: { size?: number }) => React.ReactElement;
  /** Only active on the exact path (section home pages). */
  exact?: boolean;
};

export type PortalNavGroup = { title: string; items: PortalNavItem[]; badge?: string };

/**
 * The charcoal navigation rail shared by the student, teacher and admin portals — the same dark
 * surface as the website footer, with the brand lockup on top and the site's green for the
 * current page. Each portal passes its own groups and, optionally, a footer card.
 */
export function PortalSidebar({
  homeHref,
  subtitle,
  groups,
  footer,
  onClose,
  collapsed = false,
}: {
  homeHref: string;
  subtitle: string;
  groups: PortalNavGroup[];
  footer?: React.ReactNode;
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[var(--side-bg)] text-[var(--side-fg)] border-r border-[var(--side-border)] overflow-hidden",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Faint brand ring in the corner, echoing the website's page headers. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/site/assets/images/edu/page-header-ring.svg"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute -right-16 -bottom-16 w-56 opacity-[0.06]"
      />

      <div
        className={cn(
          "relative h-16 flex items-center border-b border-[var(--side-border)] shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        <Link
          href={homeHref}
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--side-active-fg)]"
          onClick={onClose}
          title={collapsed ? `EduPortal ${subtitle}` : undefined}
          aria-label={collapsed ? `EduPortal ${subtitle}` : undefined}
        >
          <span className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(0,0,0,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/xtroedge-x.svg" alt="" width={34} height={34} />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-[17px] font-bold tracking-tight text-white">
                Edu<span className="text-[var(--side-active-fg)]">Portal</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--side-label)]">
                {subtitle}
              </span>
            </span>
          )}
        </Link>
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden h-9 w-9 -mr-2 rounded-lg flex items-center justify-center text-[var(--side-muted)] hover:text-white hover:bg-[var(--side-hover)] transition"
            aria-label="Close menu"
          >
            <Icon.X size={20} />
          </button>
        )}
      </div>

      <nav
        aria-label={`${subtitle} navigation`}
        className="relative flex-1 overflow-y-auto px-3 pt-5 pb-6 space-y-6 side-scroll"
      >
        {groups.map((g, i) => (
          <div key={g.title}>
            {collapsed ? (
              i > 0 && <div className="h-px bg-[var(--side-border)] mx-2 mb-3" aria-hidden />
            ) : (
              <div className="flex items-center gap-2 px-3 mb-2">
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--side-label)] font-semibold">
                  {g.title}
                </p>
                {g.badge && (
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-bold tracking-wide">
                    {g.badge}
                  </span>
                )}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center h-10 rounded-lg text-sm font-medium transition-colors duration-150",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--side-active-fg)]",
                        collapsed ? "justify-center px-0" : "gap-3 px-3",
                        active
                          ? "bg-[var(--side-active-bg)] text-[var(--side-active-fg)]"
                          : "text-[var(--side-muted)] hover:bg-[var(--side-hover)] hover:text-white",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--side-active-fg)]"
                        />
                      )}
                      <NavLinkIcon icon={item.icon} size={18} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("relative border-t border-[var(--side-border)] space-y-3", collapsed ? "p-3" : "p-4")}>
        {footer}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load into the public site */}
        <a
          href="/"
          onClick={onClose}
          title={collapsed ? "Back to website" : undefined}
          aria-label={collapsed ? "Back to website" : undefined}
          className={cn(
            "flex items-center h-10 rounded-lg text-sm font-medium text-[var(--side-muted)] hover:text-white hover:bg-[var(--side-hover)] transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--side-active-fg)]",
            collapsed ? "justify-center" : "gap-3 px-3",
          )}
        >
          <Icon.Globe size={18} />
          {!collapsed && <span>Back to website</span>}
        </a>
      </div>
    </aside>
  );
}
