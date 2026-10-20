/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import BlogCard from "@/components/site/content/BlogCard";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Stories about learning, product updates, career tips, and community.",
  path: "/blog",
});
const categories = ["Learning", "Product", "Career", "Community"] as const;
type Props = { searchParams: Promise<{ q?: string | string[]; category?: string | string[] }> };

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (typeof params.q === "string" ? params.q : "").trim();
  const category = typeof params.category === "string" && categories.some(c => c === params.category) ? params.category : "";
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter(post => (!category || post.category === category) && (!q || `${post.title} ${post.excerpt} ${post.body} ${post.category}`.toLowerCase().includes(q.toLowerCase())));
  return <>
    <PageHeader title="Blog" parents={[]} />
    <section className="blog-page edu-blog-page"><div className="container">
      <div className="section-title text-center"><div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">EduPortal Blog</span></div><h2 className="section-title__title">Stories from the EduPortal community</h2><p className="edu-section-intro">Tutorials, product updates, career advice, and reflections on learning.</p></div>
      <form method="get" action="/blog" className="sidebar__search-form edu-blog-filter" role="search"><label className="edu-sr-only" htmlFor="edu-blog-search">Search articles</label><input id="edu-blog-search" type="search" name="q" placeholder="Search articles" defaultValue={q} />{category && <input type="hidden" name="category" value={category} />}<button type="submit" aria-label="Search"><i className="icon-search" aria-hidden="true" /></button></form>
      <nav className="edu-blog-categories" aria-label="Filter by category"><a className={!category ? "active" : ""} href="/blog">All posts</a>{categories.map(c => <a key={c} className={category === c ? "active" : ""} href={`/blog?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>{c}</a>)}</nav>
      {posts.length ? <div className="row edu-blog-grid">{posts.map(post => <div className="col-xl-4 col-lg-4 col-md-6" key={post.slug}><BlogCard post={post} /></div>)}</div> : <div className="edu-empty"><h2>No articles found</h2><p>Try another search or category.</p><a className="thm-btn" href="/blog"><span className="icon-angles-right" />View all posts</a></div>}
    </div></section>
  </>;
}
