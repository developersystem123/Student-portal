/* eslint-disable @next/next/no-html-link-for-pages */
import NotFoundArt from "@/components/site/NotFoundArt";
import PageHeader from "@/components/site/PageHeader";

export default function NotFound() {
  return <>
    <PageHeader title="Page not found" parents={[]} />
    <section className="error-page edu-not-found"><div className="container"><div className="error-page__inner text-center">
      <div className="error-page__img"><NotFoundArt /></div>
      <div className="error-page__content"><h2>We couldn&apos;t find that page</h2><p>The EduPortal page you&apos;re looking for might have moved or no longer exists.</p><div className="btn-box edu-not-found__buttons"><a className="thm-btn" href="/"><span className="icon-angles-right" />Back to home</a><a className="edu-outline-link" href="/courses">Explore courses</a></div></div>
    </div></div></section>
  </>;
}
