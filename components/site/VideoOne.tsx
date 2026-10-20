/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.

export default function VideoOne() {
  return (
    <section className="video-one">
      <div className="video-one__shape-3 float-bob-y">
        <img src="/site/assets/images/shapes/video-one-shape-3.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="video-one__shape-4 img-bounce">
        <img src="/site/assets/images/shapes/video-one-shape-4.png" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="video-one__inner">
          <div className="video-one__shape-1" />
          <div className="video-one__shape-2 rotate-me" />
          <div className="video-one__img-box">
            <img src="/site/assets/images/edu/edu-video-lesson.png" alt="A paused EduPortal lesson on async JavaScript with code and an AI note" loading="lazy" decoding="async" />
            <div className="video-one__video-link">
              <a href="/courses" aria-label="Browse EduPortal courses">
                <div className="video-one__video-shape-1">
                  <img src="/site/assets/images/shapes/video-one-video-shape-1.png" alt="" loading="lazy" decoding="async" />
                </div>
                <div className="video-one__video-icon">
                  <span className="fa fa-play" />
                  {" "}
                  <i className="ripple" />
                </div>
              </a>
            </div>
            <div className="video-one__live">
              <div className="video-one__live-icon">
                <span className="icon-wifi" aria-hidden="true" />
              </div>
              <p className="video-one__live-text">AI-powered learning</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

