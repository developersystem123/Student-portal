// One place for the public site's identity — canonical origin, display name and the metadata
// builders every page shares. Server-safe: no database, no request APIs, safe to import anywhere.

import type { Metadata } from "next";

/**
 * Canonical origin used for every absolute URL (canonical tags, Open Graph, sitemap, JSON-LD).
 * APP_URL wins — production sits behind a proxy and that variable already drives the reset links —
 * then an explicit public URL, then the real domain as the last resort.
 */
export const SITE_URL = (
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://eduportal.app"
).replace(/\/+$/, "");

export const SITE_NAME = "EduPortal";
export const SITE_TAGLINE = "Learn · Build · Grow";
export const SITE_DESCRIPTION =
  "EduPortal blends world-class courses with an AI tutor, quiz generator and assignment helper — so you stop memorising and start understanding.";

/** Absolute URL for a site path. `absoluteUrl("/courses")` → `https://…/courses`. */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for an image that may already be hosted elsewhere (thumbnails) or local. */
export function absoluteImage(src: string): string {
  return /^https?:\/\//i.test(src) ? src : absoluteUrl(src);
}

type PageMetaInput = {
  title: string;
  description: string;
  /** Site path, e.g. "/courses/business-101". Drives the canonical URL. */
  path: string;
  /** Open Graph object type. */
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /** Absolute image URLs. When omitted the site-wide generated OG image is used. */
  images?: string[];
  /** Keep the page out of search results (auth and reset screens). */
  noIndex?: boolean;
};

/**
 * Canonical URL, Open Graph and Twitter card for one page. Spread the result into the page's
 * `metadata` export so every page carries the same social shape.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  images,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogType = type === "article" ? "article" : "website";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
