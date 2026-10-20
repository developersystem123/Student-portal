/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.
// Plain <a> on purpose: leaving this page must be a full load so the template's global CSS/JS
// never carries over into the rest of the portal.

export default function AboutOne() {
  return (
    <section className="about-one">
      <div className="about-one__shape-1">
        <img src="/site/assets/images/shapes/about-one-shape-1.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="about-one__shape-2">
        <img src="/site/assets/images/shapes/about-one-shape-2.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6 wow slideInLeft" data-wow-delay="100ms" data-wow-duration="2500ms">
            <div className="about-one__left">
              <div className="about-one__left-shape-1 rotate-me" />
              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="about-one__img-box">
                    <div className="about-one__img">
                      <img src="/site/assets/images/edu/edu-about-course.png" alt="A course in progress at 80% and the learner's best study hours" loading="lazy" decoding="async" />
                    </div>
                  </div>
                  <div className="about-one__awards-box">
                    <div className="about-one__awards-count-box">
                      <h3 className="odometer" data-count="60">00</h3>
                      <span>+</span>
                    </div>
                    <p>Countries reached</p>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="about-one__experience-box">
                    <div className="about-one__experience-box-inner">
                      <div className="about-one__experience-icon">
                        <img src="/site/assets/images/icon/about-one-experience-icon.png" alt="" loading="lazy" decoding="async" />
                      </div>
                      <div className="about-one__experience-count-box">
                        <div className="about-one__experience-count">
                          <h3 className="odometer" data-count="94">00</h3>
                          <span>%</span>
                          <p>Course</p>
                        </div>
                        <p>completion rate</p>
                      </div>
                    </div>
                    <div className="about-one__experience-box-shape" />
                  </div>
                  <div className="about-one__img-box-2">
                    <div className="about-one__img-2">
                      <img src="/site/assets/images/edu/edu-about-goals.png" alt="Learner level, weekly goal and recently earned badges" loading="lazy" decoding="async" />
                    </div>
                    <div className="about-one__img-shape-1 float-bob-y">
                      <img src="/site/assets/images/shapes/about-one-img-shape-1.png" alt="" loading="lazy" decoding="async" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="about-one__right">
              <div className="section-title text-left sec-title-animation animation-style2">
                <div className="section-title__tagline-box">
                  <div className="section-title__tagline-shape" />
                  <span className="section-title__tagline">About Us</span>
                </div>
                <h2 className="section-title__title title-animation">
                  An Entire Study Suite, Powered By{" "}
                  <span>
                    AI{" "}
                    <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" />
                  </span>
                </h2>
              </div>
              <p className="about-one__text">
                Courses are the start. The real magic happens when an AI tutor helps you actually understand what you’re learning — with practice, feedback, and support at your own pace.
              </p>
              <ul className="about-one__mission-and-vision list-unstyled">
                <li>
                  <div className="about-one__icon-and-title">
                    <div className="about-one__icon">
                      <img src="/site/assets/images/icon/mission-icon.png" alt="" loading="lazy" decoding="async" />
                    </div>
                    <h3>Our Mission:</h3>
                  </div>
                  <p className="about-one__mission-and-vision-text">
                    Make learning accessible: sign up free, pick your path, and learn at your own pace with an AI tutor by your side.
                  </p>
                </li>
                <li>
                  <div className="about-one__icon-and-title">
                    <div className="about-one__icon">
                      <img src="/site/assets/images/icon/vision-icon.png" alt="" loading="lazy" decoding="async" />
                    </div>
                    <h3>Our Vision</h3>
                  </div>
                  <p className="about-one__mission-and-vision-text">
                    Combine expert-led courses, AI-generated quizzes, assignment help, and verifiable certificates in one place.
                  </p>
                </li>
              </ul>
              <div className="about-one__btn-and-live-class">
                <div className="about-one__btn-box">
                  <a href="/about" className="about-one__btn thm-btn">
                    <span className="icon-angles-right" />
                    Know More
                  </a>
                </div>
                <h3 className="about-one__live-class">
                  Learn with AI{" "}
                  <img src="/site/assets/images/shapes/live-class-shape-1.png" alt="" loading="lazy" decoding="async" />
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
