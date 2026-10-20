/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.
// Plain <a> on purpose: leaving this page must be a full load so the template's global CSS/JS
// never carries over into the rest of the portal.
import { monogram } from "./illustrations";

export default function WhyChooseOne() {
  return (
    <section className="why-choose-one">
      <div className="why-choose-one__shape-6 float-bob-x">
        <img src="/site/assets/images/shapes/why-choose-one-shape-6.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="why-choose-one__shape-7 float-bob-y">
        <img src="/site/assets/images/shapes/why-choose-one-shape-7.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <div className="why-choose-one__left wow slideInLeft" data-wow-delay="100ms" data-wow-duration="2500ms">
              <div className="why-choose-one__img-box">
                <div className="why-choose-one__img">
                  <img src="/site/assets/images/edu/edu-art-why-tutor.png" alt="A student coding on a laptop while a friendly AI tutor explains the code" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__img-2">
                  <img src="/site/assets/images/edu/edu-why-quiz.png" alt="A generated quiz question with the correct answer selected" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__shape-1 float-bob-y">
                  <img src="/site/assets/images/shapes/why-choose-one-shape-1.png" alt="" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__shape-2 float-bob-x">
                  <img src="/site/assets/images/shapes/why-choose-one-shape-2.png" alt="" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__shape-3 float-bob-y">
                  <img src="/site/assets/images/shapes/why-choose-one-shape-3.png" alt="" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__shape-4">
                  <img src="/site/assets/images/shapes/why-choose-one-shape-4.png" alt="" loading="lazy" decoding="async" />
                </div>
                <div className="why-choose-one__shape-5 img-bounce">
                  <img src="/site/assets/images/shapes/why-choose-one-shape-5.png" alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="why-choose-one__right">
              <div className="section-title text-left sec-title-animation animation-style2">
                <div className="section-title__tagline-box">
                  <div className="section-title__tagline-shape" />
                  <span className="section-title__tagline">Why Choose Us</span>
                </div>
                <h2 className="section-title__title title-animation">
                  Courses Are Just The Start: Learn{" "}
                  <span>
                    Smarter{" "}
                    <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" />
                  </span>
                </h2>
              </div>
              <p className="why-choose-one__text">
                An entire study suite in one place: courses, an AI chat tutor, instant quizzes, assignment guidance, and verified certificates.
              </p>
              <div className="why-choose-one__points-box">
                <div className="row">
                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <ul className="why-choose-one__points-list list-unstyled">
                      <li>
                        <div className="why-choose-one__points-icon-inner">
                          <div className="why-choose-one__points-icon">
                            <img src="/site/assets/images/icon/why-choose-one-icon-1.png" alt="" loading="lazy" decoding="async" />
                          </div>
                        </div>
                        <div className="why-choose-one__points-content">
                          <h3>Learn at your pace</h3>
                          <p>Watch chapters and return whenever you have time. Your progress is saved.</p>
                        </div>
                      </li>
                      <li>
                        <div className="why-choose-one__points-icon-inner">
                          <div className="why-choose-one__points-icon">
                            <img src="/site/assets/images/icon/why-choose-one-icon-2.png" alt="" loading="lazy" decoding="async" />
                          </div>
                        </div>
                        <div className="why-choose-one__points-content">
                          <h3>Quiz generator</h3>
                          <p>Turn any topic into an instant quiz and practice smarter.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <ul className="why-choose-one__points-list list-unstyled">
                      <li>
                        <div className="why-choose-one__points-icon-inner">
                          <div className="why-choose-one__points-icon">
                            <img src="/site/assets/images/icon/why-choose-one-icon-3.png" alt="" loading="lazy" decoding="async" />
                          </div>
                        </div>
                        <div className="why-choose-one__points-content">
                          <h3>AI chat tutor</h3>
                          <p>Ask anything, anytime, and get clear explanations tuned to your level.</p>
                        </div>
                      </li>
                      <li>
                        <div className="why-choose-one__points-icon-inner">
                          <div className="why-choose-one__points-icon">
                            <img src="/site/assets/images/icon/why-choose-one-icon-4.png" alt="" loading="lazy" decoding="async" />
                          </div>
                        </div>
                        <div className="why-choose-one__points-content">
                          <h3>Verified certificates</h3>
                          <p>Earn shareable certificates that prove what you learned, course by course.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="why-choose-one__btn-and-client-box">
                <div className="why-choose-one__btn-box">
                  <a href="/about" className="why-choose-one__btn thm-btn">
                    <span className="icon-angles-right" />
                    Know More
                  </a>
                </div>
                <div className="why-choose-one__client-box">
                  <ul className="why-choose-one__client-img-list list-unstyled">
                    <li>
                      <img src={monogram("Omar Farooq", { width: 80, letters: 1 })} alt="" loading="lazy" decoding="async" />
                    </li>
                    <li>
                      <img src={monogram("Zara Malik", { width: 80, letters: 1 })} alt="" loading="lazy" decoding="async" />
                    </li>
                    <li>
                      <img src={monogram("Usman Tariq", { width: 80, letters: 1 })} alt="" loading="lazy" decoding="async" />
                    </li>
                  </ul>
                  <div className="why-choose-one__client-content">
                    <div className="why-choose-one__count-box">
                      <h3 className="odometer" data-count="60">00</h3>
                      <span>+</span>
                    </div>
                    <p>Countries reached</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
