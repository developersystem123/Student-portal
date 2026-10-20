// Live data for the site pages — server components only (it reads the database).
// Every site page renders per request (the layout reads the theme cookie), so whatever the
// admin and teacher portals change shows up on the next page load. React's cache() lets the
// layout and the page share one query per request.

import { cache } from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { toClientCourse } from "@/lib/serializers";
import { COURSES, type Course } from "@/lib/mockData";
import { COURSE_CATEGORIES, PORTAL_HOME } from "./nav";

export type Account = { href: string; label: string } | null;

/** The signed-in user's portal, or null when signed out. */
export const getAccount = cache(async (): Promise<Account> => {
  try {
    const user = await getCurrentUser();
    return user ? { href: PORTAL_HOME[user.role], label: "Dashboard" } : null;
  } catch {
    // A database hiccup must never take the marketing pages down — show the signed-out view.
    return null;
  }
});

/** Every course in the catalogue, oldest first so new courses join the end of the list. */
export const getCourses = cache(async (): Promise<Course[]> => {
  try {
    const rows = await prisma.course.findMany({
      include: { chapters: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    degradedCatalogue = false;
    return rows.map(toClientCourse);
  } catch (err) {
    // Database unreachable: keep the catalogue visible instead of showing an empty page — but flag
    // it, so the layout can tell the visitor the courses shown aren't the live ones, and the log
    // carries the real reason.
    degradedCatalogue = true;
    console.error("[data] course query failed — serving the built-in catalogue instead:", err);
    return COURSES;
  }
});

// True while the catalogue on screen came from the built-in fallback rather than the database.
let degradedCatalogue = false;

/** Whether the last catalogue read fell back to the built-in data (the database was unreachable). */
export function isUsingFallbackCatalogue(): boolean {
  return degradedCatalogue;
}

/** A course by slug (or id, for older links). */
export async function getCourse(slugOrId: string) {
  const courses = await getCourses();
  return courses.find((c) => c.slug === slugOrId || c.id === slugOrId);
}

/** The catalogue's categories with their live course counts. */
export const getCategories = cache(async () => {
  const courses = await getCourses();
  return COURSE_CATEGORIES.map((category) => ({
    ...category,
    count: courses.filter((c) => c.category === category.name).length,
  }));
});
