/* eslint-disable @next/next/no-img-element */
import { formatHours } from "@/lib/utils";
import { courseImage } from "./catalog/CourseCard";
import { getCourses } from "./data";
import StarRating from "./StarRating";

// Keep the template's Owl carousel and card markup; only the catalogue data changes.
export default async function CoursesOne() {
  const courses = await getCourses();
  return (
    <section className="courses-one">
      <div className="container">
        <div className="section-title text-center sec-title-animation animation-style1">
          <div className="section-title__tagline-box">
            <div className="section-title__tagline-shape" />
            <span className="section-title__tagline">Popular this week</span>
          </div>
          <h2 className="section-title__title title-animation">
            Start With A Course <br />That Fits <span>You <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" /></span>
          </h2>
        </div>
        <div className="courses-one__carousel owl-theme owl-carousel">
          {courses.map(course => {
            const href = `/courses/${course.slug}`;
            return (
              <div className="item" key={course.id}>
                <div className="courses-one__single">
                  <div className="courses-one__img-box">
                    <div className="courses-one__img">
                      <img src={courseImage(course)} alt={course.title} loading="lazy" decoding="async" />
                    </div>
                  </div>
                  <div className="courses-one__content">
                    <div className="courses-one__tag-and-meta">
                      <div className="courses-one__tag"><span>{course.category}</span></div>
                      <ul className="courses-one__meta list-unstyled">
                        <li><div className="icon"><span className="icon-book" /></div><p>{course.chapters.length} Lessons</p></li>
                        <li><div className="icon"><span className="icon-clock" /></div><p>{formatHours(course.durationMinutes)}</p></li>
                      </ul>
                    </div>
                    <h3 className="courses-one__title"><a href={href}>{course.title}</a></h3>
                    <div className="courses-one__ratting-and-heart-box">
                      <div className="courses-one__ratting-box">
                        <StarRating rating={course.rating} className="courses-one__ratting" />
                        <p className="courses-one__ratting-text">{course.rating} · {course.reviews.toLocaleString()} Reviews</p>
                      </div>
                      <div className="courses-one__heart"><a href={href} aria-label={`View ${course.title}`}><span className="icon-heart" /></a></div>
                    </div>
                    <div className="courses-one__btn-and-doller-box">
                      <div className="courses-one__btn-box"><a href={href} className="courses-one__btn thm-btn"><span className="icon-angles-right" /> Enroll Now</a></div>
                      <span>{course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
