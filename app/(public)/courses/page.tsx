"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/icons";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "@/components/ui";
import { MediaCard } from "@/components/MediaCard";
import { PhysicalApplicationModal } from "@/components/course/PhysicalApplicationModal";
import { COURSES, type Course, type CourseCategory } from "@/lib/mockData";
import { formatHours } from "@/lib/utils";
import { useAuth } from "@/lib/store";

const categories: ("All" | CourseCategory)[] = [
  "All",
  "Web Dev",
  "Data Science",
  "Design",
  "Business",
  "Languages",
  "Math",
];

export default function PublicCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [cat, setCat] = React.useState<"All" | CourseCategory>("All");
  const [q, setQ] = React.useState("");
  const [level, setLevel] = React.useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [physicalCourse, setPhysicalCourse] = React.useState<Course | null>(null);

  function handleApplyInPerson(c: Course) {
    if (!user) {
      toast.push({
        title: "Sign in to apply",
        description: "Create a free student account to apply for in-person classes.",
        tone: "info",
      });
      router.push("/register");
      return;
    }
    if (user.role !== "Student") {
      toast.push({
        title: "Student accounts only",
        description: "In-person applications are only available to student accounts.",
        tone: "danger",
      });
      return;
    }
    setPhysicalCourse(c);
  }

  // Read ?category= from URL on mount for footer links like /courses?category=Design
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("category");
    if (initial && categories.includes(initial as CourseCategory)) {
      setCat(initial as CourseCategory);
    }
  }, []);

  const filtered = React.useMemo(() => {
    return COURSES.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (level !== "All" && c.level !== level) return false;
      if (q.trim() && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, level, q]);

  return (
    <div>
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16 pb-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">Course catalog</p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Find a course that <span className="gradient-text">moves you forward</span>.
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Hand-picked, expert-led courses with built-in AI help. Free to browse — sign up to start learning.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-20 bg-[var(--background)]/85 backdrop-blur border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 max-w-md">
            <Input
              icon={<Icon.Search size={16} />}
              placeholder="Search courses by title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={
                  "px-3 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition " +
                  (cat === c
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="lg:ml-auto">
            <Tabs
              value={level}
              onChange={(v) => setLevel(v as typeof level)}
              options={[
                { value: "All", label: "All levels" },
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Advanced", label: "Advanced" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--muted)]">
            Showing <span className="text-[var(--foreground)] font-semibold">{filtered.length}</span> course
            {filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon.Compass size={28} />}
            title="No matches"
            description="Try a different category, level, or keyword."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setCat("All");
                  setLevel("All");
                  setQ("");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <MediaCard
                key={c.id}
                image={c.thumbnail}
                imageAlt={c.title}
                fallbackIcon={<Icon.Book size={30} />}
                bodyClassName="space-y-3"
                overlay={
                  <>
                    <Link
                      href={user ? `/my-courses` : `/register`}
                      aria-label={c.title}
                      className="absolute inset-0 pointer-events-auto"
                    />
                    <Badge variant="primary" className="absolute top-3 left-3 backdrop-blur bg-white/85 dark:bg-black/40">
                      {c.category}
                    </Badge>
                    {c.price === 0 && (
                      <Badge variant="success" className="absolute top-3 right-3">
                        Free
                      </Badge>
                    )}
                  </>
                }
              >
                  <div>
                    <h3 className="font-semibold line-clamp-2 hover:text-[var(--primary)] transition">
                      <Link href={user ? `/my-courses` : `/register`}>{c.title}</Link>
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-1">{c.instructor}</p>
                  </div>
                  <p className="text-sm text-[var(--muted)] line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Icon.Star size={12} className="text-amber-500" />
                      {c.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon.Clock size={12} /> {formatHours(c.durationMinutes)}
                    </span>
                    <span>{c.level}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-base font-bold">{c.price === 0 ? "Free" : `$${c.price}`}</span>
                    <Link
                      href={user ? `/my-courses` : `/register`}
                      className="text-xs text-[var(--primary)] font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      {user ? "Open" : "Enroll online"} <Icon.ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="mt-auto pt-3 border-t border-dashed border-[var(--border)]">
                    <Button
                      variant="soft"
                      className="w-full"
                      type="button"
                      onClick={() => handleApplyInPerson(c)}
                    >
                      <Icon.Calendar size={16} /> Apply for in-person classes
                    </Button>
                  </div>
              </MediaCard>
            ))}
          </div>
        )}
      </section>

      <PhysicalApplicationModal
        course={physicalCourse}
        open={!!physicalCourse}
        onClose={() => setPhysicalCourse(null)}
      />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold">Not sure where to start?</h2>
            <p className="mt-1 text-white/85">
              Tell us your goals and we&apos;ll suggest a path. Or just sign up free and explore.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90">
                {user ? "Open dashboard" : "Sign up free"} <Icon.ChevronRight size={18} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
