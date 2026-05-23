"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icons";
import { NavLinkIcon } from "./NavLinkIcon";
import { cn } from "@/lib/utils";

const main = [
  { href: "/admin", label: "Overview", icon: Icon.Home, exact: true },
  { href: "/admin/students", label: "Students", icon: Icon.User },
  { href: "/admin/teachers", label: "Teachers", icon: Icon.Sparkles },
  { href: "/admin/courses", label: "Courses", icon: Icon.Book },
  { href: "/admin/learning-paths", label: "Learning Paths", icon: Icon.Route },
  { href: "/admin/enrollments", label: "Enrollments", icon: Icon.ListChecks },
  { href: "/admin/applications", label: "In-Person Apps", icon: Icon.Calendar },
  { href: "/admin/physical-classes", label: "Physical Classes", icon: Icon.Pin },
  { href: "/admin/certificates", label: "Certificates", icon: Icon.Award },
];

const operations = [
  { href: "/admin/live-classes", label: "Live Classes", icon: Icon.Video },
  { href: "/admin/forum", label: "Forum", icon: Icon.Globe },
  { href: "/admin/reviews", label: "Reviews", icon: Icon.Star },
  { href: "/admin/coupons", label: "Coupons", icon: Icon.Tag },
  { href: "/admin/payments", label: "Payments", icon: Icon.CreditCard },
  { href: "/admin/support", label: "Support", icon: Icon.MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: Icon.BarChart3 },
];

const account = [
  { href: "/admin/notifications", label: "Notifications", icon: Icon.Bell },
  { href: "/admin/profile", label: "Profile", icon: Icon.User },
  { href: "/admin/settings", label: "Settings", icon: Icon.Settings },
];

export function AdminSidebar({
  onClose,
  collapsed = false,
}: {
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)]",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={cn(
          "h-12 flex items-center border-b border-[var(--border)] shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        <Link
          href="/admin"
          className="flex items-center gap-2 group"
          onClick={onClose}
          title={collapsed ? "EduPortal Admin" : undefined}
        >
          <div className="h-8 w-8 rounded-xl btn-primary flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition">
            <Icon.Settings size={16} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold gradient-text">EduPortal</span>
              <span className="text-[10px] text-[var(--muted-2)] -mt-0.5 tracking-wider">ADMIN CONSOLE</span>
            </div>
          )}
        </Link>
        {onClose && !collapsed && (
          <button onClick={onClose} className="lg:hidden p-2 -mr-2 text-[var(--muted)]" aria-label="Close sidebar">
            <Icon.X size={20} />
          </button>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto pt-5 pb-6 space-y-6 scrollbar-thin scrollbar-fade",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <NavGroup title="Manage" items={main} pathname={pathname} onClose={onClose} collapsed={collapsed} />
        <NavGroup title="Operations" items={operations} pathname={pathname} onClose={onClose} collapsed={collapsed} />
        <NavGroup title="Account" items={account} pathname={pathname} onClose={onClose} collapsed={collapsed} />
      </nav>

      {collapsed ? (
        <div className="p-2">
          <Link
            href="/"
            onClick={onClose}
            title="Back to Home"
            aria-label="Back to Home"
            className="flex items-center justify-center h-10 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
          >
            <Icon.ArrowLeft size={18} />
          </Link>
        </div>
      ) : (
        <div className="p-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 h-10 px-3 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition"
          >
            <Icon.ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  onClose,
  collapsed,
}: {
  title: string;
  items: { href: string; label: string; icon: (p: { size?: number }) => React.ReactElement; exact?: boolean }[];
  pathname: string;
  onClose?: () => void;
  collapsed?: boolean;
}) {
  return (
    <div>
      {collapsed ? (
        <div className="h-px bg-[var(--border)] mx-2 mb-2 first:hidden" aria-hidden />
      ) : (
        <div className="flex items-center gap-2 px-3 mb-2">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted-2)] font-semibold">{title}</p>
        </div>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const Icn = item.icon;
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
                className={cn(
                  "flex items-center h-10 rounded-xl text-sm font-medium transition-all",
                  collapsed ? "justify-center px-0" : "gap-3 px-3",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
                )}
              >
                <NavLinkIcon icon={Icn} size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
