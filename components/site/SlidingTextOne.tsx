/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.

export default function SlidingTextOne() {
  return (
    <section className="sliding-text-one">
      <div className="sliding-text-one__wrap">
        <div className="sliding-text__list marquee_mode">
          <div className="sliding-text__item">
            <h2 data-hover="60+ Countries reached" className="sliding-text__title">
              <span className="odometer" data-count="60">60</span>
              + Countries reached{" "}
              <img src="/site/assets/images/shapes/sliding-text-shape-1.png" alt="" loading="lazy" decoding="async" />
            </h2>
          </div>
          <div className="sliding-text__item">
            <h2 data-hover="850+ Expert-led courses" className="sliding-text__title">
              <span className="odometer" data-count="850">850</span>
              + Expert-led courses{" "}
              <img src="/site/assets/images/shapes/sliding-text-shape-1.png" alt="" loading="lazy" decoding="async" />
            </h2>
          </div>
          <div className="sliding-text__item">
            <h2 data-hover="AI Tutor Anytime" className="sliding-text__title">
              24/7 Support{" "}
              <img src="/site/assets/images/shapes/sliding-text-shape-1.png" alt="" loading="lazy" decoding="async" />
            </h2>
          </div>
          <div className="sliding-text__item">
            <h2 data-hover="Verified Certificates" className="sliding-text__title">
              Verified Certificates{" "}
              <img src="/site/assets/images/shapes/sliding-text-shape-1.png" alt="" loading="lazy" decoding="async" />
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

