/* eslint-disable @next/next/no-img-element */
import type { Course } from "@/lib/mockData";
import { formatHours } from "@/lib/utils";
import EnrollLink from "./EnrollLink";
import { topicCover } from "../illustrations";

// Same cover the portal's own catalogue shows; the topic illustration only fills in for a course without one.
export function courseImage(course: Course) {
  if (course.thumbnail) return course.thumbnail;
  return topicCover(course.category);
}

// Two letters from the instructor's name, for the small byline avatar.
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export default function CourseCard({ course }: { course: Course }) {
  const href = `/courses/${encodeURIComponent(course.slug)}`;
  return (
    // The card used to stack three calls to action (View course, Enroll online, Apply for in-person
    // classes) behind two dividers, which is what made it read as crowded. There is one primary
    // action now — enroll — and the title and image carry the link to the full course page, where
    // the in-person application also lives.
    <article className="courses-two__single edu-course-card">
      <div className="courses-two__img-box">
        <div className="courses-two__img"><a href={href} tabIndex={-1} aria-hidden="true"><img src={courseImage(course)} alt="" loading="lazy" decoding="async" /></a></div>
        <span className="edu-course-card__category">{course.category}</span>
      </div>
      <div className="courses-two__content">
        <div className="courses-two__doller-and-review">
          <div className="courses-two__doller"><p>{course.price === 0 ? "Free" : `$${course.price}`}</p></div>
          <div className="courses-two__review"><p><i className="icon-star" aria-hidden="true" /> {course.rating} <span>({course.reviews.toLocaleString()} Reviews)</span></p></div>
        </div>
        <h3 className="courses-two__title"><a href={href}>{course.title}</a></h3>
        <p className="edu-course-card__description">{course.description}</p>
        <ul className="courses-two__meta list-unstyled">
          <li><div className="icon"><span className="icon-chart-simple" /></div><p>{course.level}</p></li>
          <li><div className="icon"><span className="icon-book" /></div><p>{course.chapters.length} lessons</p></li>
          <li><div className="icon"><span className="icon-clock" /></div><p>{formatHours(course.durationMinutes)}</p></li>
        </ul>
        <div className="edu-course-card__footer">
          <p className="edu-course-card__byline"><span className="edu-course-card__avatar" aria-hidden="true">{initials(course.instructor)}</span><span className="edu-course-card__byline-name">{course.instructor}</span></p>
          <EnrollLink className="edu-course-card__enroll" next={href} signedIn={<>Open course <i className="icon-angles-right" /></>}>Enroll online <i className="icon-angles-right" /></EnrollLink>
        </div>
      </div>
    </article>
  );
}
