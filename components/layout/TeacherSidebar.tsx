"use client";

import Icon from "@/components/icons";
import { PortalSidebar, type PortalNavGroup } from "./PortalSidebar";

const groups: PortalNavGroup[] = [
  {
    title: "Teaching",
    items: [
      { href: "/teacher", label: "Overview", icon: Icon.Home, exact: true },
      { href: "/teacher/courses", label: "My Courses", icon: Icon.Book },
      { href: "/teacher/students", label: "My Students", icon: Icon.User },
    ],
  },
  {
    title: "Classroom",
    items: [
      { href: "/teacher/assignments", label: "Assignments", icon: Icon.FilePen },
      { href: "/teacher/quizzes", label: "Quizzes", icon: Icon.ListChecks },
      { href: "/teacher/grades", label: "Gradebook", icon: Icon.Award },
      { href: "/teacher/certificates", label: "Certificates", icon: Icon.Star },
      { href: "/teacher/attendance", label: "Attendance", icon: Icon.CheckCircle },
      { href: "/teacher/physical-classes", label: "Physical Classes", icon: Icon.Pin },
      { href: "/teacher/schedule", label: "Schedule", icon: Icon.Calendar },
      { href: "/teacher/live", label: "Live Classes", icon: Icon.Video },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/teacher/messages", label: "Messages", icon: Icon.MessageSquare },
      { href: "/teacher/forum", label: "Forum", icon: Icon.Globe },
      { href: "/teacher/announcements", label: "Announcements", icon: Icon.Megaphone },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/teacher/analytics", label: "Analytics", icon: Icon.BarChart3 },
      { href: "/teacher/earnings", label: "Earnings", icon: Icon.Wallet },
      { href: "/teacher/reviews", label: "Reviews", icon: Icon.Star },
    ],
  },
  {
    title: "AI Suite",
    badge: "NEW",
    items: [
      { href: "/teacher/ai/quiz", label: "AI Quiz", icon: Icon.Sparkles },
      { href: "/teacher/ai/assignment", label: "AI Assignment", icon: Icon.Spark },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/teacher/notifications", label: "Notifications", icon: Icon.Bell },
      { href: "/teacher/profile", label: "Profile", icon: Icon.User },
      { href: "/teacher/settings", label: "Settings", icon: Icon.Settings },
    ],
  },
];

export function TeacherSidebar({ onClose, collapsed = false }: { onClose?: () => void; collapsed?: boolean }) {
  return (
    <PortalSidebar homeHref="/teacher" subtitle="Teacher studio" groups={groups} onClose={onClose} collapsed={collapsed} />
  );
}
