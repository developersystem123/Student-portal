/* eslint-disable @next/next/no-img-element */
import type { BlogPost } from "@/lib/blogPosts";
import { blogCover } from "@/components/site/illustrations";

export function postImage(post: BlogPost) {
  return blogCover(post.slug);
}

export function postDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return <div className="blog-two__single edu-blog-card">
    {/* The publish date used to be a tab pinned over the artwork, where it clipped the illustration.
        It now sits with the rest of the metadata so the thumbnail stays clean. */}
    <a className="blog-two__img" href={`/blog/${post.slug}`}><img src={postImage(post)} alt={post.title} loading="lazy" decoding="async" /></a>
    <div className="blog-two__content">
      <div className="blog-two__meta-box"><ul className="blog-two__meta list-unstyled">
        <li><span><span className="icon-calendar" aria-hidden="true" />{postDate(post.publishedAt)}</span></li>
        <li><a href={`/blog?category=${encodeURIComponent(post.category)}`}><span className="icon-tags" aria-hidden="true" />{post.category}</a></li>
        <li><span><span className="icon-clock" aria-hidden="true" />{post.readMinutes} min read</span></li>
      </ul></div>
      <h2 className="blog-two__title"><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
      <p className="blog-two__text">{post.excerpt}</p>
      <p className="edu-blog-card__author">By {post.author}</p>
    </div>
  </div>;
}
