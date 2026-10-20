/* eslint-disable @next/next/no-img-element */
import { getCategories } from "@/components/site/data";

export default async function CategoryOne() {
  const categories = await getCategories();
  return (
    <section className="category-one">
      <div className="category-one__bg-shape" style={{ backgroundImage: "url(/site/assets/images/shapes/category-one-bg-shape.png)" }} />
      <div className="category-one__shape-1"><img src="/site/assets/images/shapes/category-one-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="category-one__shape-2"><img src="/site/assets/images/shapes/category-one-shape-2.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="category-one__shape-3"><img src="/site/assets/images/shapes/category-one-shape-3.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="category-one__social-media">
        <ul className="category-one__social-media-list list-unstyled">
          <li><h3>Web Dev</h3></li>
          <li><img src="/site/assets/images/shapes/category-one-social-media-shape-1.png" alt="" loading="lazy" decoding="async" /></li>
          <li><h3>Data Science</h3></li>
          <li><img src="/site/assets/images/shapes/category-one-social-media-shape-1.png" alt="" loading="lazy" decoding="async" /></li>
          <li><h3>Design</h3></li>
        </ul>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-7">
            <div className="category-one__left">
              <div className="section-title text-left sec-title-animation animation-style2">
                <div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">Explore by topic</span></div>
                <h2 className="section-title__title title-animation">Pick a path that <br />excites <span>you <img src="/site/assets/images/shapes/section-title-shape-2.png" alt="" loading="lazy" decoding="async" /></span></h2>
              </div>
              <ul className="category-one__category-list list-unstyled">
                {categories.map((category) => (
                  <li key={category.name}>
                    <div className="category-one__count-and-arrow">
                      <div className="category-one__count-box">
                        <div className="category-one__count" />
                        <div className="category-one__count-content"><h3><a href={category.href}>{category.name}</a></h3><p>{category.count} {category.count === 1 ? "Course" : "Courses"}</p></div>
                      </div>
                      <div className="category-one__count-arrow"><a href={category.href} aria-label={`Explore ${category.name}`}><span className="icon-arrow-up-right-2" /></a></div>
                    </div>
                    <div className="category-one__hover-icon-and-arrow">
                      <div className="category-one__hover-icon-box">
                        <div className="category-one__hover-icon"><img src={category.icon} alt="" loading="lazy" decoding="async" /></div>
                        <div className="category-one__hover-content"><h3><a href={category.href}>{category.name}</a></h3><p>{category.count} {category.count === 1 ? "Course" : "Courses"}</p></div>
                      </div>
                      <div className="category-one__hover-arrow"><a href={category.href} aria-label={`Explore ${category.name}`}><span className="icon-arrow-up-right-2" /></a></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-xl-6 col-lg-5 wow slideInRight" data-wow-delay="100ms" data-wow-duration="2500ms">
            <div className="category-one__right"><div className="category-one__img"><img src="/site/assets/images/edu/edu-category-dashboard.png" alt="Hours studied by topic this semester, from the EduPortal dashboard" loading="lazy" decoding="async" /></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
