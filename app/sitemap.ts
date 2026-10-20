import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getCourses } from "@/components/site/data";
import { BLOG_POSTS } from "@/lib/blogPosts";

// Every indexable page of the public site. The portal, the API and the account-help screens are
// deliberately absent (see app/robots.ts).
const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/business", priority: 0.6, changeFrequency: "monthly" },
  { path: "/teach", priority: 0.6, changeFrequency: "monthly" },
  { path: "/affiliate", priority: 0.5, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/testimonials", priority: 0.5, changeFrequency: "monthly" },
  { path: "/press", priority: 0.4, changeFrequency: "monthly" },
  { path: "/verify", priority: 0.4, changeFrequency: "monthly" },
  { path: "/status", priority: 0.3, changeFrequency: "daily" },
  { path: "/sitemap", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.3, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const courses = await getCourses();
  const courseEntries: MetadataRoute.Sitemap = courses
    .filter((course) => course?.slug)
    .map((course) => ({
      url: absoluteUrl(`/courses/${course.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const postEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...courseEntries, ...postEntries];
}
