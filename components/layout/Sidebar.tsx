"use client";

import Link from "next/link";
import Icon from "@/components/icons";
import { PortalSidebar, type PortalNavGroup } from "./PortalSidebar";
import { useAuth } from "@/lib/store";

const groups: PortalNavGroup[] = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Icon.Home },
      { href: "/my-courses", label: "My Courses", icon: Icon.Book },
      { href: "/explore", label: "Explore", icon: Icon.Compass },
      { href: "/wishlist", label: "Wishlist", icon: Icon.Heart },
    ],
  },
  {
    title: "Learning",
    items: [
      { href: "/paths", label: "Learning Paths", icon: Icon.Route },
      { href: "/assignments", label: "Assignments", icon: Icon.FilePen },
      { href: "/quizzes", label: "Quizzes", icon: Icon.ListChecks },
      { href: "/live", label: "Live Classes", icon: Icon.Video },
      { href: "/schedule", label: "Schedule", icon: Icon.Calendar },
      { href: "/progress", label: "Progress", icon: Icon.TrendingUp },
      { href: "/achievements", label: "Achievements", icon: Icon.Star },
      { href: "/certificates", label: "Certificates", icon: Icon.Award },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/forum", label: "Forum", icon: Icon.MessageSquare },
      { href: "/messages", label: "Messages", icon: Icon.Inbox },
      { href: "/physical-classes", label: "Physical Classes", icon: Icon.Pin },
      { href: "/applications", label: "In-Person Apps", icon: Icon.Tag },
    ],
  },
  {
    title: "AI Suite",
    badge: "NEW",
    items: [
      { href: "/ai/chat", label: "AI Chat", icon: Icon.Sparkles },
      { href: "/ai/quiz", label: "Quiz Generator", icon: Icon.ListChecks },
      { href: "/ai/assignment", label: "Assignment Helper", icon: Icon.FilePen },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Icon.Bell },
      { href: "/billing", label: "Billing", icon: Icon.CreditCard },
      { href: "/subscription", label: "Subscription", icon: Icon.Crown },
      { href: "/support", label: "Help & Support", icon: Icon.Help },
      { href: "/settings", label: "Settings", icon: Icon.Settings },
      { href: "/profile", label: "Profile", icon: Icon.User },
    ],
  },
];

export function Sidebar({ onClose, collapsed = false }: { onClose?: () => void; collapsed?: boolean }) {
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "team";

  const plan = collapsed ? (
    <Link
      href="/subscription"
      onClick={onClose}
      title={isPro ? "Pro plan active" : "Upgrade to Pro"}
      aria-label={isPro ? "Pro plan active" : "Upgrade to Pro"}
      className="flex items-center justify-center h-10 rounded-lg bg-[var(--side-surface)] text-amber-300 ring-1 ring-white/5 hover:ring-amber-300/40 transition"
    >
      <Icon.Crown size={18} />
    </Link>
  ) : (
    <Link
      href="/subscription"
      onClick={onClose}
      className="group block rounded-xl p-4 bg-[var(--side-surface)] ring-1 ring-white/5 hover:ring-[var(--side-active-fg)]/30 transition"
    >
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-lg bg-amber-400/15 text-amber-300 flex items-center justify-center">
          <Icon.Crown size={16} />
        </span>
        <p className="text-sm font-semibold text-white">{isPro ? "Pro plan active" : "Upgrade to Pro"}</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--side-muted)]">
        {isPro ? "Unlimited AI help and every premium course." : "Unlimited AI help, premium courses and certificates."}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--side-active-fg)]">
        {isPro ? "Manage plan" : "See plans"}
        <Icon.ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );

  return (
    <PortalSidebar
      homeHref="/dashboard"
      subtitle="Student"
      groups={groups}
      footer={plan}
      onClose={onClose}
      collapsed={collapsed}
    />
  );
}
