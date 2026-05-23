"use client";

import * as React from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icons";
import { Button, Modal } from "@/components/ui";
import { SignedOutPopup } from "@/components/layout/SignedOutPopup";
import { useAuth, useTheme } from "@/lib/store";
import { cn } from "@/lib/utils";

// Inline pending hint placed inside <Link>. Reads its own Link's pending
// status (Next 16 useLinkStatus) and reports up so the navbar can render a
// global top progress bar. The CSS keeps the dot invisible for the first
// 100ms so fast prefetched navigations don't flash a hint at all.
function LinkPending({ report }: { report: (delta: number) => void }) {
  const { pending } = useLinkStatus();
  React.useEffect(() => {
    if (!pending) return;
    report(1);
    return () => report(-1);
  }, [pending, report]);
  return <span aria-hidden className={cn("link-hint", pending && "is-pending")} />;
}

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/business", label: "For Business" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type MoreGroup = {
  title: string;
  items: { href: string; label: string; description: string; icon: React.ReactNode }[];
};

const moreMenu: MoreGroup[] = [
  {
    title: "Earn & teach",
    items: [
      {
        href: "/teach",
        label: "Become a Teacher",
        description: "Share what you know, earn 70% revenue share.",
        icon: <Icon.Award size={16} />,
      },
      {
        href: "/affiliate",
        label: "Affiliate program",
        description: "30% recurring commission on every Pro referral.",
        icon: <Icon.TrendingUp size={16} />,
      },
      {
        href: "/careers",
        label: "Careers",
        description: "Help us build the future of learning.",
        icon: <Icon.Users size={16} />,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        href: "/blog",
        label: "Blog",
        description: "Guides, deep-dives, and learning tips.",
        icon: <Icon.Book size={16} />,
      },
      {
        href: "/help",
        label: "Help Center",
        description: "Articles & how-tos, search-first.",
        icon: <Icon.Help size={16} />,
      },
      {
        href: "/faq",
        label: "FAQ",
        description: "Common questions, grouped by topic.",
        icon: <Icon.MessageSquare size={16} />,
      },
      {
        href: "/status",
        label: "Service status",
        description: "Uptime & incident history.",
        icon: <Icon.CheckCircle size={16} />,
      },
      {
        href: "/press",
        label: "Press & Media",
        description: "News, brand kit, and media contacts.",
        icon: <Icon.Megaphone size={16} />,
      },
    ],
  },
];

const moreHrefs = moreMenu.flatMap((g) => g.items.map((i) => i.href));

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [signedOut, setSignedOut] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const reportPending = React.useCallback((delta: number) => {
    setPendingCount((c) => Math.max(0, c + delta));
  }, []);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const moreRef = React.useRef<HTMLDivElement | null>(null);

  const moreActive = moreHrefs.some((h) => pathname.startsWith(h));

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
    if (userMenuOpen) setUserMenuOpen(false);
    if (moreOpen) setMoreOpen(false);
  }

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!userMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  React.useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled ? "glass border-b border-[var(--border)]" : "bg-transparent",
      )}
    >
      {pendingCount > 0 && <div className="nav-progress" aria-hidden />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-xl shadow-md shadow-green-500/20 group-hover:shadow-lg group-hover:shadow-green-500/30 transition shrink-0"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-base font-bold gradient-text">EduPortal</span>
            <span className="text-[10px] text-[var(--muted-2)] -mt-0.5 tracking-wider">LEARN · BUILD · GROW</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 h-9 rounded-lg text-sm font-medium inline-flex items-center transition",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                )}
              >
                {l.label}
                <LinkPending report={reportPending} />
              </Link>
            );
          })}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={cn(
                "px-3 h-9 rounded-lg text-sm font-medium inline-flex items-center gap-1 transition",
                moreOpen || moreActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
              )}
            >
              More
              <Icon.ChevronDown
                size={14}
                className={cn("transition-transform", moreOpen && "rotate-180")}
              />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-[36rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden fade-in z-50"
              >
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
                  {moreMenu.map((group) => (
                    <div key={group.title} className="p-2">
                      <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold">
                        {group.title}
                      </p>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              role="menuitem"
                              href={item.href}
                              onClick={() => setMoreOpen(false)}
                              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition"
                            >
                              <span className="shrink-0 h-8 w-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] inline-flex items-center justify-center">
                                {item.icon}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-[var(--foreground)] leading-tight">
                                  {item.label}
                                  <LinkPending report={reportPending} />
                                </span>
                                <span className="block text-xs text-[var(--muted)] mt-0.5 leading-snug">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-10 w-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition"
          >
            {theme === "dark" ? <Icon.Sun size={18} /> : <Icon.Moon size={18} />}
          </button>
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition",
                  userMenuOpen
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)]",
                )}
              >
                <Icon.User size={18} />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden fade-in z-50"
                >
                  <div className="px-3 py-2.5 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                  </div>
                  <Link
                    href={user.role === "Admin" ? "/admin/profile" : "/profile"}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 h-10 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
                  >
                    <Icon.User size={16} />
                    Profile page
                  </Link>
                  <Link
                    href={user.role === "Admin" ? "/admin" : user.role === "Instructor" ? "/teacher" : "/dashboard"}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 h-10 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
                  >
                    {user.role === "Admin" ? <Icon.Settings size={16} /> : user.role === "Instructor" ? <Icon.Users size={16} /> : <Icon.Book size={16} />}
                    {user.role === "Admin" ? "Admin Portal" : user.role === "Instructor" ? "Teacher Portal" : "Student Portal"}
                  </Link>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setConfirmLogout(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 h-10 text-sm text-[var(--danger)] hover:bg-red-500/10 transition"
                  >
                    <Icon.Logout size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>
                  Get started <Icon.ChevronRight size={16} />
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-10 w-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition"
          >
            {theme === "dark" ? <Icon.Sun size={18} /> : <Icon.Moon size={18} />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="h-10 w-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition"
          >
            {open ? <Icon.X size={20} /> : <Icon.Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-3 h-11 rounded-xl text-sm font-medium inline-flex items-center transition",
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  {l.label}
                  <LinkPending report={reportPending} />
                </Link>
              );
            })}
            {moreMenu.map((group) => (
              <div key={group.title} className="mt-2">
                <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 h-11 rounded-xl text-sm font-medium inline-flex items-center gap-2.5 transition",
                        active
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                      )}
                    >
                      <span className="text-[var(--primary)]">{item.icon}</span>
                      {item.label}
                      <LinkPending report={reportPending} />
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="h-px bg-[var(--border)] my-2" />
            {user ? (
              <div className="flex flex-col gap-2">
                <Link href={user.role === "Admin" ? "/admin/profile" : "/profile"}>
                  <Button variant="outline" className="w-full">
                    <Icon.User size={16} /> Profile page
                  </Button>
                </Link>
                <Link href={user.role === "Admin" ? "/admin" : user.role === "Instructor" ? "/teacher" : "/dashboard"}>
                  <Button variant="outline" className="w-full">
                    {user.role === "Admin" ? <Icon.Settings size={16} /> : user.role === "Instructor" ? <Icon.Users size={16} /> : <Icon.Book size={16} />}
                    {user.role === "Admin" ? "Admin Portal" : user.role === "Instructor" ? "Teacher Portal" : "Student Portal"}
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => setConfirmLogout(true)}>
                  <Icon.Logout size={16} /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Sign out?" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-[var(--muted)]">
            You&apos;ll need to sign back in to access your account.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={async () => {
                setConfirmLogout(false);
                await logout();
                setSignedOut(true);
              }}
            >
              <Icon.Logout size={16} /> Sign out
            </Button>
          </div>
        </div>
      </Modal>

      <SignedOutPopup open={signedOut} redirectTo="/" />
    </header>
  );
}
