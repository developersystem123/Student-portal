/* eslint-disable @next/next/no-img-element */
import { getCourses } from "./data";
import { monogram } from "./illustrations";

export default async function TeamOne() {
  // Only named instructors in the course catalogue; without an uploaded avatar they get a monogram card.
  const courses = await getCourses();
  const instructors = [...new Map(courses.filter((course) => course.instructor !== "Demo Instructor").map((course) => [course.instructor, course])).values()];
  return (
    <section className="team-one">
      <div className="team-one__shape-1 shapemover"><img src="/site/assets/images/shapes/team-one-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="team-one__shape-2 float-bob-y"><img src="/site/assets/images/shapes/team-one-shape-2.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="team-one__shape-3"><img src="/site/assets/images/shapes/team-one-shape-3.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="team-one__shape-4 float-bob-x"><img src="/site/assets/images/shapes/team-one-shape-4.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="container">
        <div className="section-title text-left sec-title-animation animation-style2">
          <div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">Our instructors</span></div>
          <h2 className="section-title__title title-animation">Learn From People <br />Who Know Their <span>Craft <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" /></span></h2>
        </div>
        <div className="team-one__carousel owl-theme owl-carousel">
          {instructors.map((course) => (
            <div className="item" key={course.instructor}>
              <div className="team-one__single">
                <div className="team-one__img-box">
                  <div className="team-one__img"><img src={course.instructorAvatar || monogram(course.instructor, { width: 305, height: 360, portrait: true })} alt="" loading="lazy" decoding="async" /></div>
                  <div className="team-one__content">
                    <div className="team-one__single-bg-shape" style={{ backgroundImage: "url(/site/assets/images/shapes/team-one-single-bg-shape.png)" }} />
                    <div className="team-one__content-shape-1"><img src="/site/assets/images/shapes/team-one-content-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
                    <div className="team-one__content-shape-2"><img src="/site/assets/images/shapes/team-one-content-shape-2.png" alt="" loading="lazy" decoding="async" /></div>
                    <div className="team-one__plus-and-social">
                      <div className="team-one__plus"><span className="icon-plus" /></div>
                      <div className="team-one__social">
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-linkedin-in" /></a>{" "}
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-pinterest-p" /></a>{" "}
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-facebook-f" /></a>{" "}
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-instagram" /></a>
                      </div>
                    </div>
                    <h3 className="team-one__title"><a href={`/courses/${course.slug}`}>{course.instructor}</a></h3>
                    <p className="team-one__sub-title">{course.category} instructor</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
