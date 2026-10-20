/* eslint-disable @next/next/no-img-element */
// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.

export default function NewsletterOne() {
  return (
    <section className="newsletter-one">
      <div className="container">
        <div className="newsletter-one__inner">
          <div className="newsletter-one__bg-shape" style={{ backgroundImage: "url(/site/assets/images/shapes/newsletter-one-bg-shape.png)" }} />
          <div className="newsletter-one__shape-1 float-bob-y">
            <img src="/site/assets/images/shapes/newsletter-one-shape-1.png" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="newsletter-one__shape-2 img-bounce">
            <img src="/site/assets/images/shapes/newsletter-one-shape-2.png" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="newsletter-one__img">
            <img src="/site/assets/images/edu/edu-newsletter.png" alt="" loading="lazy" decoding="async" />
          </div>
          <h2 className="newsletter-one__title">Ready to learn smarter?</h2>
          <p className="newsletter-one__text">
            Join thousands of students using AI to study less, learn more, and actually enjoy it.
            <br />
            {" "}Get in touch to hear more about EduPortal.
          </p>
          <form className="newsletter-one__contact-form" action="mailto:hello@eduportal.app?subject=EduPortal%20updates" method="post" encType="text/plain">
            <div className="newsletter-one__contact-input-box">
              <input type="email" placeholder="Enter email address" aria-label="Your email address" name="email" required />
              {" "}
              <button type="submit" className="thm-btn">
                <span className="icon-angles-right" />
Get updates
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
