"use client";

import Icon from "@/components/icons";
import { PortalSidebar, type PortalNavGroup } from "./PortalSidebar";

const groups: PortalNavGroup[] = [
  {
    title: "Manage",
    items: [
      { href: "/admin", label: "Overview", icon: Icon.Home, exact: true },
      { href: "/admin/students", label: "Students", icon: Icon.User },
      { href: "/admin/teachers", label: "Teachers", icon: Icon.Sparkles },
      { href: "/admin/courses", label: "Courses", icon: Icon.Book },
      { href: "/admin/learning-paths", label: "Learning Paths", icon: Icon.Route },
      { href: "/admin/enrollments", label: "Enrollments", icon: Icon.ListChecks },
      { href: "/admin/applications", label: "In-Person Apps", icon: Icon.Calendar },
      { href: "/admin/physical-classes", label: "Physical Classes", icon: Icon.Pin },
      { href: "/admin/certificates", label: "Certificates", icon: Icon.Award },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/live-classes", label: "Live Classes", icon: Icon.Video },
      { href: "/admin/forum", label: "Forum", icon: Icon.Globe },
      { href: "/admin/reviews", label: "Reviews", icon: Icon.Star },
      { href: "/admin/coupons", label: "Coupons", icon: Icon.Tag },
      { href: "/admin/payments", label: "Payments", icon: Icon.CreditCard },
      { href: "/admin/support", label: "Support", icon: Icon.MessageSquare },
      { href: "/admin/reports", label: "Reports", icon: Icon.BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Icon.Bell },
      { href: "/admin/profile", label: "Profile", icon: Icon.User },
      { href: "/admin/settings", label: "Settings", icon: Icon.Settings },
    ],
  },
];

export function AdminSidebar({ onClose, collapsed = false }: { onClose?: () => void; collapsed?: boolean }) {
  return (
    <PortalSidebar homeHref="/admin" subtitle="Admin console" groups={groups} onClose={onClose} collapsed={collapsed} />
  );
}
