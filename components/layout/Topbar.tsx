"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/icons";
import { Avatar, Badge, Button, Modal } from "@/components/ui";
import { SignedOutPopup } from "@/components/layout/SignedOutPopup";
import { useAuth, useData, useTheme } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";

export function Topbar({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const isAdmin = user?.role === "Admin";
  const isTeacher = user?.role === "Instructor";
  const portalRoot = isAdmin ? "/admin" : isTeacher ? "/teacher" : "";
  const notificationsHref = portalRoot ? `${portalRoot}/notifications` : "/notifications";
  const profileHref = portalRoot ? `${portalRoot}/profile` : "/profile";

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [signedOut, setSignedOut] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-[var(--border)] h-16 flex items-center gap-3 px-4 sm:px-6">
      {/* Sidebar toggle — works on both desktop (collapse) and mobile (drawer) */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
        aria-label="Toggle sidebar"
        className="h-10 w-10 -ml-1 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition shrink-0"
      >
        <Icon.Menu size={20} />
      </button>

      {/* Search — centered on the header */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className={cn(
          "relative transition-all w-full max-w-xl",
          searchFocused && "scale-[1.01]",
        )}>
          <Icon.Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="search"
            placeholder={
              isAdmin
                ? "Search students, courses, enrollments…"
                : isTeacher
                  ? "Search your courses or students…"
                  : "Search courses, AI tools, or anything…"
            }
            className={cn(
              "w-full h-11 pl-11 pr-24 rounded-xl text-sm transition-all",
              "bg-[var(--surface-2)] border border-transparent",
              "focus:outline-none focus:bg-[var(--surface)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/40",
              "placeholder:text-[var(--muted-2)]",
            )}
            onFocus={() => {
              setSearchFocused(true);
              router.prefetch(isAdmin ? "/admin/students" : isTeacher ? "/teacher/students" : "/explore");
            }}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                router.push(isAdmin ? "/admin/students" : isTeacher ? "/teacher/students" : "/explore");
            }}
          />
          <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono text-[var(--muted)]">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>

      {/* Quick action — AI Suite (student only) */}
      {!isAdmin && !isTeacher && (
        <Link
          href="/ai/chat"
          className="hidden md:inline-flex h-10 items-center gap-1.5 px-3 rounded-xl text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-400/10 text-[var(--primary)] border border-[var(--primary)]/15 hover:border-[var(--primary)]/30 transition"
        >
          <Icon.Sparkles size={15} />
          <span>Ask AI</span>
        </Link>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="h-10 w-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition shrink-0"
      >
        {theme === "dark" ? <Icon.Sun size={18} /> : <Icon.Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="h-10 w-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--primary-soft)] text-[var(--muted)] hover:text-[var(--primary)] flex items-center justify-center transition relative"
        >
          <Icon.Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--background)]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--surface)] border border-[var(--border)] card-shadow fade-in overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs text-[var(--muted)]">
                  {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "You're all caught up"}
                </p>
              </div>
              <Link
                href={notificationsHref}
                onClick={() => setNotifOpen(false)}
                className="text-xs text-[var(--primary)] hover:underline font-medium"
              >
                See all
              </Link>
            </div>
            <ul className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "p-3 hover:bg-[var(--surface-2)] cursor-pointer flex gap-3 border-b border-[var(--border)] last:border-b-0 transition",
                    !n.read && "bg-[var(--primary-soft)]/40",
                  )}
                  onClick={() => {
                    markNotificationRead(n.id);
                    setNotifOpen(false);
                    router.push(notificationsHref);
                  }}
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                    {n.type === "assignment" && <Icon.FilePen size={15} />}
                    {n.type === "announcement" && <Icon.Megaphone size={15} />}
                    {n.type === "reminder" && <Icon.Clock size={15} />}
                    {n.type === "achievement" && <Icon.Award size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-[var(--muted-2)] mt-1">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                  )}
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="p-8 text-center text-sm text-[var(--muted)]">
                  <Icon.Bell size={24} className="mx-auto mb-2 opacity-50" />
                  No notifications yet
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative shrink-0" ref={userMenuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 h-10 pl-1 pr-2 sm:pr-3 rounded-xl hover:bg-[var(--surface-2)] transition"
        >
          <Avatar name={user?.name ?? "?"} src={user?.avatar ?? null} size={32} />
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">{user?.name?.split(" ")[0]}</span>
            <span className="text-[10px] text-[var(--muted)] -mt-0.5">{user?.role ?? "Student"}</span>
          </div>
          <Icon.ChevronDown size={14} className="hidden md:block text-[var(--muted)]" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[var(--surface)] border border-[var(--border)] card-shadow fade-in p-2 overflow-hidden">
            <div className="px-3 py-3 border-b border-[var(--border)] mb-1 flex items-center gap-3">
              <Avatar name={user?.name ?? "?"} src={user?.avatar ?? null} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
                <Badge variant="primary" className="mt-1">{user?.role}</Badge>
              </div>
            </div>
            <MenuItem href={profileHref} icon={<Icon.User size={16} />} onClick={() => setMenuOpen(false)}>
              My Profile
            </MenuItem>
            <MenuItem href={notificationsHref} icon={<Icon.Bell size={16} />} onClick={() => setMenuOpen(false)}>
              Notifications
            </MenuItem>
            {(isAdmin || isTeacher) && (
              <MenuItem
                href={isAdmin ? "/admin/settings" : "/teacher/settings"}
                icon={<Icon.Settings size={16} />}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </MenuItem>
            )}
            <div className="h-px bg-[var(--border)] my-1" />
            <button
              onClick={() => {
                setMenuOpen(false);
                setConfirmLogout(true);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-[var(--danger)] hover:bg-red-500/10 transition"
            >
              <Icon.Logout size={16} /> Sign out
            </button>
          </div>
        )}
      </div>

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

      <SignedOutPopup
        open={signedOut}
        message="You've been signed out"
        description="Redirecting you to the sign-in page…"
        redirectTo="/login"
      />
    </header>
  );
}

function MenuItem({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
    >
      <span className="text-[var(--muted)]">{icon}</span>
      {children}
    </Link>
  );
}
