/* eslint-disable @next/next/no-img-element */
import { formatHours } from "@/lib/utils";
import { getCourses } from "./data";
import { topicCover } from "./illustrations";

// No public live-class schedule is seeded; show real, available courses instead of fake live timers.
export default async function LiveClassOne() {
  const courses = await getCourses();
  return (
    <section className="live-class-one">
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <div className="live-class-one__left">
              <div className="section-title text-left sec-title-animation animation-style2">
                <div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">Pick your path</span></div>
                <h2 className="section-title__title title-animation">Learn At Your Own Pace, <span>Anywhere <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" /></span></h2>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="live-class-one__right">
              <div className="live-class-one__carousel owl-theme owl-carousel">
                {courses.map((course) => (
                  <div className="item" key={course.id}>
                    <div className="live-class-one__single">
                      <div className="live-class-one__img">
                        <img src={topicCover(course.category)} alt="" loading="lazy" decoding="async" />
                        <div className="live-class-one__btn-box"><a href={`/courses/${course.slug}`} className="thm-btn">Explore Course</a></div>
                      </div>
                      <div className="live-class-one__content">
                        <h3 className="live-class-one__title"><a href={`/courses/${course.slug}`}>{course.title}</a></h3>
                        <div className="live-class-one__class-time"><div className="live-class-one__circle" /><p className="live-class-one__class-time-text">Self-paced · {formatHours(course.durationMinutes)}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
