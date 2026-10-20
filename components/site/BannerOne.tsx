/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.
// Plain <a> on purpose: leaving this page must be a full load so the template's global CSS/JS
// never carries over into the rest of the portal.
import { COURSE_CATEGORIES } from "@/components/site/nav";
import { getAccount } from "@/components/site/data";
import { monogram } from "@/components/site/illustrations";

export default async function BannerOne() {
  const account = await getAccount();
  return (
    <section className="banner-one">
      <div className="banner-one__bg-shape-1" style={{ backgroundImage: "url(/site/assets/images/shapes/banner-one-bg-shape-1.png)" }} />
      <div className="banner-one__icon-1 img-bounce">
        <img src="/site/assets/images/icon/idea-bulb.png" alt="" />
      </div>
      <div className="banner-one__icon-2 float-bob-x">
        <img src="/site/assets/images/icon/3d-alarm.png" alt="" />
      </div>
      <div className="banner-one__icon-3 float-bob-y">
        <img src="/site/assets/images/icon/linke-icon.png" alt="" />
      </div>
      <div className="banner-one__shape-4 float-bob-x">
        <img src="/site/assets/images/shapes/banner-one-shape-4.png" alt="" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <div className="banner-one__left">
              <div className="banner-one__title-box">
                <div className="banner-one__title-box-shape">
                  <img src="/site/assets/images/shapes/banner-one-title-box-shape-1.png" alt="" />
                </div>
                <h1 className="banner-one__title">
                  Learn anything,{" "}
                  <br />
                  <span className="banner-one__title-clr-1">faster</span>{" "}
                  <span className="banner-one__title-clr-2">with AI.</span>
                </h1>
              </div>
              <p className="banner-one__text">
                EduPortal blends world-class courses with an AI tutor, quiz generator, and assignment helper — so you stop memorizing and start understanding.
              </p>
              <div className="banner-one__thm-and-other-btn-box">
                <div className="banner-one__btn-box">
                  <a href={account ? account.href : "/register"} className="thm-btn">
                    <span className="icon-angles-right" />
                    {account ? "Open dashboard" : "Get started free"}
                  </a>
                </div>
                <div className="banner-one__other-btn-box">
                  <a href="/courses" className="banner-one__other-btn-1">
                    <span className="icon-thumbs-up" />
                    Browse courses
                  </a>
                  {" "}
                  <a href="/pricing" className="banner-one__other-btn-1 banner-one__other-btn-2">
                    <span className="icon-thumbs-up" />
                    No credit card
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="banner-one__right">
              <div className="banner-one__img-box">
                <div className="banner-one__img">
                  <img className="edu-hero-light" src="/site/assets/images/edu/edu-hero-dashboard.png" width={1062} height={1330} fetchPriority="high" alt="EduPortal student dashboard with the course in progress, study hours, quiz score and weekly goal" />
                  <img className="edu-hero-dark" src="/site/assets/images/edu/edu-hero-dashboard-dark.png" width={1062} height={1330} alt="" />
                  <div className="banner-one__img-shape-box rotate-me">
                    <div className="banner-one__img-shape-1">
                      <div className="banner-one__img-shape-2" />
                    </div>
                    <div className="banner-one__shape-1">
                      <img src="/site/assets/images/shapes/banner-one-shape-1.png" alt="" />
                    </div>
                    <div className="banner-one__shape-2 rotate-me">
                      <img src="/site/assets/images/shapes/banner-one-shape-2.png" alt="" />
                    </div>
                    <div className="banner-one__shape-3">
                      <img src="/site/assets/images/shapes/banner-one-shape-3.png" alt="" />
                    </div>
                  </div>
                  <div className="banner-one__udemy-review">
                    <div className="banner-one__udemy-review-img">
                      <img src={monogram("Sara Iqbal", { width: 112 })} alt="" />
                    </div>
                    <div className="banner-one__udemy-review-logo">
                      <strong className="edu-banner-badge">EduPortal</strong>
                    </div>
                    <div className="banner-one__udemy-review-client-info">
                      <p className="banner-one__udemy-review-client-name">AI-powered learning</p>
                      <div className="banner-one__udemy-review-star" role="img" aria-label="Rated 5 out of 5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <span key={i} className="icon-star" aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="banner-one__student-trained">
                    <div className="banner-one__student-trained-shape-1 rotate-me">
                      <img src="/site/assets/images/shapes/banner-one-student-trained-shape-1.png" alt="" />
                    </div>
                    <ul className="list-unstyled banner-one__student-trained-list">
                      <li>
                        <div className="banner-one__student-trained-img">
                          <img src={monogram("Bilal Ahmed", { width: 80, letters: 1 })} alt="" />
                        </div>
                      </li>
                      <li>
                        <div className="banner-one__student-trained-img">
                          <img src={monogram("Hina Raza", { width: 80, letters: 1 })} alt="" />
                        </div>
                      </li>
                    </ul>
                    <div className="banner-one__student-trained-count-box">
                      <div className="banner-one__student-trained-count-box-inner count-box">
                        <p className="count-text" data-stop="1.2" data-speed="3000">0.0</p>
                        <span>M+</span>
                      </div>
                      <p className="banner-one__student-trained-text">Active learners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="banner-one__category-search-box">
              <div className="banner-one__category-search-inner">
                <div className="banner-one__category-select-box">
                  <div className="select-box">
                    <select className="wide" name="category" form="edu-course-search" aria-label="Course category">
                      <option value="" data-display="All Categories">All Categories</option>
                      {COURSE_CATEGORIES.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
                    </select>
                  </div>
                </div>
                <form id="edu-course-search" className="banner-one__category-form" action="/courses" method="get" role="search">
                  <div className="banner-one__category-input">
                    <input type="search" name="q" aria-label="Search courses" placeholder="Find your course" />
                  </div>
                  <button type="submit" className="banner-one__category-btn">Search</button>
                </form>
              </div>
              <div className="banner-one__tags">
                {COURSE_CATEGORIES.map((category) => <a key={category.name} href={category.href}>{category.name}</a>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
