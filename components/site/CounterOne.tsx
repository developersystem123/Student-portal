/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.

export default function CounterOne() {
  return (
    <section className="counter-one">
      <div className="counter-one__bg" style={{ backgroundImage: "url(/site/assets/images/edu/edu-counter-band.png)" }}>
        <div className="counter-one__video-link">
          <div className="counter-one__video-shape-1">
            <img src="/site/assets/images/shapes/counter-one-video-shape-1.png" alt="" loading="lazy" decoding="async" />
          </div>
          <a href="/courses" aria-label="Explore EduPortal courses">
            <div className="counter-one__video-icon">
              <span className="icon-play" />
              {" "}
              <i className="ripple" />
            </div>
          </a>
        </div>
      </div>
      <div className="counter-one__shape-1" style={{ backgroundImage: "url(/site/assets/images/shapes/counter-one-shape-1.png)" }} />
      <div className="container">
        <div className="row">
          <div className="col-xl-8">
            <div className="counter-one__left">
              <ul className="counter-one__list list-unstyled">
                <li>
                  <div className="counter-one__count-hover-img" style={{ backgroundImage: "url(/site/assets/images/edu/edu-counter-hover.png)" }} />
                  {/* The theme's counter floors every step, so a decimal stat ("1.2M+") would read
                      as "1M+" for the whole run and then jump. It renders static instead. */}
                  <div className="counter-one__count">
                    <h3 className="count-text">1.2</h3>
                    <span>M+</span>
                  </div>
                  <p>Active learners</p>
                </li>
                <li>
                  <div className="counter-one__count-hover-img" style={{ backgroundImage: "url(/site/assets/images/edu/edu-counter-hover.png)" }} />
                  <div className="counter-one__count count-box">
                    <h3 className="count-text" data-stop="850" data-speed="1500">00</h3>
                    <span>+</span>
                  </div>
                  <p>Expert-led courses</p>
                </li>
                <li>
                  <div className="counter-one__count-hover-img" style={{ backgroundImage: "url(/site/assets/images/edu/edu-counter-hover.png)" }} />
                  <div className="counter-one__count count-box">
                    <h3 className="count-text" data-stop="94" data-speed="1500">00</h3>
                    <span>%</span>
                  </div>
                  <p>Completion rate</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

