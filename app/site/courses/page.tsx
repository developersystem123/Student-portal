/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import CourseCard from "@/components/site/catalog/CourseCard";
import Pagination from "@/components/site/catalog/Pagination";
import { getAccount, getCategories, getCourses } from "@/components/site/data";
import type { CourseLevel } from "@/lib/mockData";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Courses",
  description: "Browse expert-led EduPortal courses by category and skill level.",
  path: "/courses",
});
type Props = { searchParams: Promise<{ category?: string | string[]; q?: string | string[]; level?: string | string[]; page?: string | string[] }> };
const first = (v?: string | string[]) => Array.isArray(v) ? v[0] ?? "" : v ?? "";
const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];
// Three rows of two cards on desktop.
const PAGE_SIZE = 6;

export default async function CoursesPage({ searchParams }: Props) {
  const [params, courses, categories, account] = await Promise.all([searchParams, getCourses(), getCategories(), getAccount()]);
  const category = first(params.category);
  const level = first(params.level);
  const q = first(params.q).trim();
  const filtered = courses.filter(c =>
    (!category || c.category === category) &&
    (!level || c.level === level) &&
    (!q || c.title.toLowerCase().includes(q.toLowerCase()))
  );
  // Facet counts. Every filter link keeps the filters it is not changing (see filterHref), so each
  // count has to be worked out the same way: a category option is counted with the level and search
  // filters applied but not the category one, and "All" drops just that one filter. That way the
  // numbers always match what clicking the link actually shows.
  const matches = (c: (typeof courses)[number], omit: "category" | "level") =>
    (omit === "category" || !category || c.category === category) &&
    (omit === "level" || !level || c.level === level) &&
    (!q || c.title.toLowerCase().includes(q.toLowerCase()));
  const countWhere = (predicate: (c: (typeof courses)[number]) => boolean, omit: "category" | "level") =>
    courses.filter(c => matches(c, omit) && predicate(c)).length;
  const categoryCount = (name: string) => countWhere(c => c.category === name, "category");
  const levelCount = (name: CourseLevel) => countWhere(c => c.level === name, "level");
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Out-of-range or malformed page numbers fall back to the nearest real page.
  const page = Math.min(Math.max(Number.parseInt(first(params.page), 10) || 1, 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);
  // Changing a filter starts again from page 1; page links keep the filters and jump to the results.
  const filterHref = (categoryValue: string, levelValue: string, pageValue = 1) => {
    const query = new URLSearchParams();
    if (categoryValue) query.set("category", categoryValue);
    if (levelValue) query.set("level", levelValue);
    if (q) query.set("q", q);
    if (pageValue > 1) query.set("page", String(pageValue));
    return `/courses${query.size ? `?${query}` : ""}`;
  };
  const pageHref = (pageValue: number) => `${filterHref(category, level, pageValue)}#course-results`;
  const heading = (title: string) => <div className="course-grid__title-box"><h3 className="course-grid__title">{title}</h3><div className="course-grid__title-shape-1"><img src="/site/assets/images/shapes/course-grid-title-shape-1.png" alt="" loading="lazy" decoding="async" /></div></div>;

  return (
    <>
      <PageHeader title="Courses" />
      <section className="course-grid edu-catalog">
        <div className="container">
          <div className="edu-catalog__intro"><span className="section-title-two__tagline">Course catalog</span><h2>Find a course that moves you forward.</h2><p>Hand-picked, expert-led courses with built-in AI help. Free to browse — sign up to start learning.</p></div>
          <div className="row">
            <div className="col-xl-4 col-lg-5"><aside className="course-grid__left" aria-label="Course filters"><div className="course-grid__sidebar">
              <div className="course-grid__search course-grid__single">{heading("Search Now")}<p className="course-grid__search-text">Find a course by title.</p>
                <form action="/courses" method="get"><label className="edu-sr-only" htmlFor="edu-course-search">Search courses by title</label><input id="edu-course-search" type="search" name="q" defaultValue={q} placeholder="Search courses by title…" />{category && <input type="hidden" name="category" value={category} />}{level && <input type="hidden" name="level" value={level} />}<button type="submit"><i className="icon-search" />Search</button></form>
              </div>
              <div className="course-grid__categories course-grid__single">{heading("Categories")}<ul className="list-unstyled course-grid__list-item">
                {[{ name: "All", count: countWhere(() => true, "category") }, ...categories.map(c => ({ name: c.name, count: categoryCount(c.name) }))].map(c => {
                  const active = category === c.name || (!category && c.name === "All");
                  return <li key={c.name}><span className="course-grid__list-check" aria-hidden="true" /><a className={`course-grid__list-text ${active ? "edu-filter-active" : ""}`} aria-current={active ? "true" : undefined} href={filterHref(c.name === "All" ? "" : c.name, level)}>{c.name} <span className={`edu-filter-count${c.count === 0 ? " edu-filter-count--empty" : ""}`}>({c.count})</span></a></li>;
                })}
              </ul></div>
              <div className="course-grid__skill course-grid__single">{heading("Skills Level")}<ul className="list-unstyled course-grid__list-item">
                {(["All", ...levels] as const).map(l => {
                  const active = level === l || (!level && l === "All");
                  const count = l === "All" ? countWhere(() => true, "level") : levelCount(l);
                  return <li key={l}><span className="course-grid__list-check" aria-hidden="true" /><a className={`course-grid__list-text ${active ? "edu-filter-active" : ""}`} aria-current={active ? "true" : undefined} href={filterHref(category, l === "All" ? "" : l)}>{l === "All" ? "All levels" : l} <span className={`edu-filter-count${count === 0 ? " edu-filter-count--empty" : ""}`}>({count})</span></a></li>;
                })}
              </ul></div>
            </div></aside></div>
            <div className="col-xl-8 col-lg-7"><div className="course-grid__right" id="course-results">
              <div className="course-list__right-top"><p className="course-list__right-top-text" aria-live="polite">{filtered.length ? <>Showing {shown.length > 1 ? `${start + 1}–${start + shown.length}` : start + 1} of {filtered.length} course{filtered.length === 1 ? "" : "s"}{filtered.length < courses.length && ` (${courses.length} in total)`}</> : <>Showing 0 of {courses.length} courses</>}</p>{(category || level || q) && <a className="edu-reset" href="/courses">Reset filters</a>}</div>
              {filtered.length ? <><div className="course-grid__right-content-box"><div className="row">{shown.map(c => <div key={c.id} className="col-xl-6 col-md-6 edu-catalog__column"><CourseCard course={c} /></div>)}</div></div><Pagination page={page} totalPages={totalPages} href={pageHref} label="Course pages" /></> : <div className="edu-catalog__empty"><span className="icon-search" aria-hidden="true" /><h3>No matches</h3><p>Try a different category, level, or keyword.</p><a href="/courses" className="thm-btn"><span className="icon-angles-right" />Reset filters</a></div>}
            </div></div>
          </div>
        </div>
      </section>
      <section className="edu-catalog-cta"><div className="container"><div className="edu-catalog-cta__inner"><div><h2>Not sure where to start?</h2><p>Tell us your goals and we&apos;ll suggest a path. {account ? "Or jump back into your dashboard." : "Or just sign up free and explore."}</p></div><div className="edu-catalog-cta__links"><a href={account ? account.href : "/register"} className="thm-btn"><span className="icon-angles-right" />{account ? "Open dashboard" : "Sign up free"}</a><a href="/contact" className="edu-catalog-cta__contact">Contact us</a></div></div></div></section>
    </>
  );
}
