"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PortalShell } from "@/components/layout/PortalShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Admin" storageKey="eduportal:admin-sidebar-open" sidebar={AdminSidebar} className="admin-theme">
      {children}
    </PortalShell>
  );
}
