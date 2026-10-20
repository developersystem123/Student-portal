"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppPreloader from "@/components/layout/AppPreloader";
import { Topbar } from "@/components/layout/Topbar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { useAuth, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

type SidebarComponent = (p: { onClose?: () => void; collapsed?: boolean }) => React.ReactElement;

// Where each role belongs when it opens another role's portal.
const HOME: Record<Role, string> = { Student: "/dashboard", Instructor: "/teacher", Admin: "/admin" };

/**
 * The frame every portal shares: sign-in and role guard, the charcoal sidebar (collapsible on
 * desktop, a drawer on mobile), the top bar and the scrolling content column.
 */
export function PortalShell({
  role,
  storageKey,
  sidebar: Side,
  className,
  children,
}: {
  role: Role;
  /** localStorage key remembering whether the desktop sidebar is expanded. */
  storageKey: string;
  sidebar: SidebarComponent;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) setDesktopOpen(raw === "1");
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      window.location.replace("/login");
      return;
    }
    if (user.role !== role) router.replace(HOME[user.role] ?? "/dashboard");
  }, [hydrated, loading, user, role, router]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, desktopOpen ? "1" : "0");
    } catch {}
  }, [desktopOpen, hydrated, storageKey]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!hydrated || loading || !user || user.role !== role) return <AppPreloader />;

  function handleToggle() {
    if (window.innerWidth >= 1024) setDesktopOpen((o) => !o);
    else setMobileOpen((o) => !o);
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-[var(--background)]", className)}>
      <NavigationProgress />
      <div
        className={cn(
          "hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-out",
          desktopOpen ? "w-72" : "w-20",
        )}
      >
        <Side collapsed={!desktopOpen} />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-[#0b1018]/60 backdrop-blur-[2px] fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] drawer-in shadow-2xl">
            <Side onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onToggleSidebar={handleToggle} sidebarOpen={desktopOpen} />
        <main id="main-content" className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[1320px] mx-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
