/* eslint-disable @next/next/no-img-element */
import { monogram } from "./illustrations";
import StarRating from "./StarRating";

// Learner stories from the original EduPortal home page, shown with monogram avatars.
const stories = [
  { name: "Priya R.", role: "CS Student", quote: "The AI tutor explained recursion in a way three textbooks couldn't. I aced my finals." },
  { name: "Marco D.", role: "Career switcher", quote: "Went from zero to my first React job in five months. The course paths are unreal." },
  { name: "Aisha K.", role: "Designer", quote: "I love that I can quiz myself on anything. It makes studying feel like a game." },
];

export default function TestimonialOne() {
  return (
    <section className="testimonial-one">
      <div className="testimonial-one__shape-1 float-bob-x"><img src="/site/assets/images/shapes/testimonial-one-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="testimonial-one__shape-2"><img src="/site/assets/images/shapes/testimonial-one-shape-2.png" alt="" loading="lazy" decoding="async" /></div>
      <div className="container">
        <div className="section-title text-left sec-title-animation animation-style2">
          <div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">Loved by learners</span></div>
          <h2 className="section-title__title title-animation">Stories From <br /><span>Students <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" /></span></h2>
        </div>
        <div className="testimonial-one__inner">
          <div className="testimonial-one__carousel owl-theme owl-carousel">
            {stories.map((story) => (
              <div className="item" key={story.name}>
                <div className="testimonial-one__single">
                  <div className="testimonial-one__img-inner">
                    <div className="testimonial-one__img">
                      <img src={monogram(story.name, { width: 273 })} alt="" loading="lazy" decoding="async" />
                      <div className="testimonial-one__icon"><span className="icon-graduation-cap" /></div>
                    </div>
                  </div>
                  <div className="testimonial-one__content">
                    <div className="testimonial-one__client-info">
                      <h3 className="testimonial-one__client-name"><a href="/testimonials">{story.name}</a></h3>
                      <p className="testimonial-one__client-sub-title">{story.role}</p>
                    </div>
                    <p className="testimonial-one__text">{story.quote}</p>
                    <div className="testimonial-one__ratting-and-social">
                      <StarRating rating={5} className="testimonial-one__ratting" label="Five stars" />
                      <div className="testimonial-one__social">
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-linkedin-in" /></a>{" "}
                        <a href="#" aria-hidden="true" tabIndex={-1}><span className="fab fa-pinterest-p" /></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
