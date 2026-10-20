"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/store";

// Same as the portal catalogue: signed-out visitors sign up, signed-in users open their courses.
// `next` carries the course path into sign-up (and on to sign-in) so the visitor comes back to the
// course they were about to enrol in instead of landing on the dashboard.
export default function EnrollLink({ children, signedIn, className, next }: { children: ReactNode; signedIn?: ReactNode; className?: string; next?: string }) {
  const { user } = useAuth();
  const href = user ? "/my-courses" : next ? `/register?next=${encodeURIComponent(next)}` : "/register";
  return <a href={href} className={className}>{user && signedIn ? signedIn : children}</a>;
}
