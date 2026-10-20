"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { PortalShell } from "@/components/layout/PortalShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="Student" storageKey="eduportal:sidebar-open" sidebar={Sidebar}>
      {children}
    </PortalShell>
  );
}
