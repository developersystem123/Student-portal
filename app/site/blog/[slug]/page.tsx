/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/site/PageHeader";
import BlogCard, { postDate, postImage } from "@/components/site/content/BlogCard";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { absoluteImage, absoluteUrl, pageMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
const categories = ["Learning", "Product", "Career", "Community"] as const;
export function generateStaticParams() { return BLOG_POSTS.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) return { title: "Post not found", description: "This EduPortal article could not be found. Browse the blog for the latest guides and announcements.", robots: { index: false, follow: false } };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    authors: [post.author],
    images: [absoluteImage(post.thumbnail)],
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();
  // The related row is two columns, so fill it even when the post's own category has no neighbours:
  // same-category posts first, then the most recent posts from other categories.
  const sameCategory = BLOG_POSTS.filter(p => p.slug !== slug && p.category === post.category);
  const others = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).filter(p => p.slug !== slug && p.category !== post.category);
  const related = [...sameCategory, ...others].slice(0, 2);
  const recent = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).filter(p => p.slug !== slug).slice(0, 3);
  return <>
    <PageHeader title={post.title} parents={[{ href: "/blog", label: "Blog" }]} />
    {/* Article structured data for the post. */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: absoluteImage(post.thumbnail),
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          articleSection: post.category,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: "EduPortal", url: absoluteUrl("/") },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        }),
      }}
    />
    <section className="blog-details edu-blog-details"><div className="container"><div className="row">
      <div className="col-xl-8 col-lg-7"><article className="blog-details__left">
        <div className="blog-details__img-box"><div className="blog-details__img"><img src={postImage(post)} alt={post.title} loading="lazy" decoding="async" /></div></div>
        <div className="blog-details__content">
          <h2 className="blog-details__title-1">{post.title}</h2>
          <p className="edu-blog-details__excerpt">{post.excerpt}</p>
          <div className="blog-details__client-and-meta"><div className="blog-details__client-box"><div className="blog-details__client-content"><p>Published by</p><h3>{post.author}</h3></div></div>
            <ul className="blog-details__client-meta list-unstyled"><li><div className="icon"><span className="icon-calendar" /></div><p>{postDate(post.publishedAt)}</p></li><li><div className="icon"><span className="icon-tags" /></div><p>{post.category}</p></li><li><div className="icon"><span className="icon-clock" /></div><p>{post.readMinutes} min read</p></li></ul>
          </div>
          <div className="edu-blog-details__body">{post.body.split(/\n\n+/).map((block, i) => {
            if (block.startsWith("## ")) return <h3 key={i} className="blog-details__title-2">{block.slice(3)}</h3>;
            return <p key={i} className="blog-details__text-2">{block.split(/(\*\*[^*]+\*\*)/g).map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>)}</p>;
          })}</div>
          <div className="blog-details__tag-and-share"><div className="blog-details__tag"><span>Category:</span><a href={`/blog?category=${post.category}`}>{post.category}</a></div><a href="/blog">← All posts</a></div>
          {related.length > 0 && <section className="edu-blog-related"><h2 className="blog-details__title-2">Related posts</h2><div className="row">{related.map(p => <div className="col-md-6" key={p.slug}><BlogCard post={p} /></div>)}</div></section>}
          <div className="edu-blog-cta"><h2>Like this post?</h2><p>Join EduPortal and start learning with AI tutoring today.</p><a href="/register" className="thm-btn"><span className="icon-angles-right" />Get started free</a></div>
        </div>
      </article></div>
      <div className="col-xl-4 col-lg-5"><aside className="sidebar" aria-label="Blog sidebar">
        <div className="sidebar__single sidebar__search"><div className="sidebar__title-box"><div className="sidebar__title-icon"><img src="/site/assets/images/icon/sidebar-title-icon.png" alt="" loading="lazy" decoding="async" /></div><h2 className="sidebar__title">Search</h2></div><p className="sidebar__search-text">Find EduPortal stories and learning guides.</p><form className="sidebar__search-form" action="/blog" method="get" role="search"><label className="edu-sr-only" htmlFor="edu-sidebar-search">Search articles</label><input id="edu-sidebar-search" name="q" type="search" placeholder="Search articles" /><button type="submit" aria-label="Search"><i className="icon-search" aria-hidden="true" /></button></form></div>
        <div className="sidebar__single sidebar__category"><div className="sidebar__title-box"><div className="sidebar__title-icon"><img src="/site/assets/images/icon/sidebar-title-icon.png" alt="" loading="lazy" decoding="async" /></div><h2 className="sidebar__title">Category</h2></div><ul className="sidebar__category-list list-unstyled">{categories.map(c => <li key={c} className={post.category === c ? "active" : ""}><a href={`/blog?category=${c}`}>{c} - ({BLOG_POSTS.filter(p => p.category === c).length})<span className="fas fa-arrow-right" /></a></li>)}</ul></div>
        <div className="sidebar__single sidebar__post"><div className="sidebar__title-box"><div className="sidebar__title-icon"><img src="/site/assets/images/icon/sidebar-title-icon.png" alt="" loading="lazy" decoding="async" /></div><h2 className="sidebar__title">Latest posts</h2></div><ul className="sidebar__post-list list-unstyled">{recent.map(p => <li key={p.slug}><div className="sidebar__post-image"><img src={postImage(p)} alt={p.title} loading="lazy" decoding="async" /></div><div className="sidebar__post-content"><ul className="sidebar__post-meta list-unstyled"><li><p><span className="icon-tags" />{p.category}</p></li><li><p><span className="icon-clock" />{p.readMinutes} min</p></li></ul><h3 className="sidebar__post-title"><a href={`/blog/${p.slug}`}>{p.title}</a></h3></div></li>)}</ul></div>
        <div className="sidebar__single sidebar__tag"><div className="sidebar__title-box"><div className="sidebar__title-icon"><img src="/site/assets/images/icon/sidebar-title-icon.png" alt="" loading="lazy" decoding="async" /></div><h2 className="sidebar__title">Topics</h2></div><div className="sidebar__tag-list">{categories.map(c => <a key={c} href={`/blog?category=${c}`}>{c}</a>)}</div></div>
      </aside></div>
    </div></div></section>
  </>;
}
