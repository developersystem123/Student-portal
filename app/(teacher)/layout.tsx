"use client";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { PortalShell } from "@/components/layout/PortalShell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Instructor" storageKey="eduportal:teacher-sidebar-open" sidebar={TeacherSidebar} className="teacher-theme">
      {children}
    </PortalShell>
  );
}
