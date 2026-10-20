/* eslint-disable @next/next/no-img-element */
import { BLOG_POSTS } from "@/lib/blogPosts";
import { blogCover, monogram } from "@/components/site/illustrations";

const latestPosts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export default function BlogOne() {
  return (
    <section className="blog-one">
      <div className="container">
        <div className="section-title text-center sec-title-animation animation-style1">
          <div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">EduPortal blog</span></div>
          <h2 className="section-title__title title-animation">Guides, Deep-Dives & <br />Learning <span>Tips <img src="/site/assets/images/shapes/section-title-shape-1.png" alt="" loading="lazy" decoding="async" /></span></h2>
        </div>
        <div className="blog-one__carousel owl-theme owl-carousel">
          {latestPosts.map((post) => {
            const href = `/blog/${post.slug}`;
            return (
              <div className="item" key={post.slug}>
                <div className="blog-one__single">
                  <div className="blog-one__img"><img src={blogCover(post.slug)} alt="" loading="lazy" decoding="async" /></div>
                  <div className="blog-one__content">
                    <ul className="blog-one__meta list-unstyled">
                      <li><a href={href}><span className="icon-calendar" />{new Date(`${post.publishedAt}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })}</a></li>
                      <li><a href={href}><span className="icon-comment" />{post.readMinutes} min read</a></li>
                    </ul>
                    <h3 className="blog-one__title"><a href={href}>{post.title}</a></h3>
                    <p className="blog-one__text">{post.excerpt}</p>
                    <div className="blog-one__btn-and-user-box">
                      <div className="blog-one__btn-box"><a href={href} className="thm-btn"><span className="icon-angles-right" /> Read More</a></div>
                      <div className="blog-one__user-box">
                        <div className="blog-one__user-img"><img src={monogram(post.author, { width: 80 })} alt="" loading="lazy" decoding="async" /></div>
                        <div className="blog-one__user-content"><h4 className="blog-one__user-name">{post.author}</h4><p className="blog-one__user-sub-title">{post.category}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
