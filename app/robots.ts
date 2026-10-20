import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// The marketing site is open; the authenticated portal, the JSON API and the account-help screens
// (which carry one-time tokens) stay out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/teacher", "/dashboard", "/login", "/register", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
