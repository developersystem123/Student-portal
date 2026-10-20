import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Unknown URLs reach this route through the fallback rewrite in next.config.ts, so they get the site's own
// 404 (app/site/not-found.tsx, inside the site header and footer) instead of the portal's.
export const metadata: Metadata = {
  title: "Page not found",
  description: "The EduPortal page you're looking for might have moved or no longer exists.",
  robots: { index: false, follow: false },
};

export default function MissingPage() {
  notFound();
}
