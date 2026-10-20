import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import SectionTitle from "@/components/site/forms/SectionTitle";
import HelpExplorer from "@/components/site/forms/HelpExplorer";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Help Center",
  description: "Guides, troubleshooting and answers to help you get the most out of EduPortal — from enrolment through to certificates.",
  path: "/help",
});
// The search text lives in the query string (?q=…) so a specific search can be linked and shared.
// It is read here, on the server, and passed down so the first paint is already filtered.
export default async function HelpPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  return <>
    <PageHeader title="Help Center" parents={[]} />
    <section className="faq-page edu-help-page"><div className="container">
      <SectionTitle eyebrow="Help Center" center>How can we <span>help you?</span></SectionTitle>
      <HelpExplorer initialQuery={query ?? ""} />
    </div></section>
    <section className="edu-feature-section edu-section-alt"><div className="container"><div className="row edu-feature-grid">
      <div className="col-md-6"><div className="contact-two__single edu-feature-card"><div className="contact-two__icon"><i className="fas fa-question-circle" aria-hidden="true" /></div>
        <h2 className="contact-two__title">Browse the FAQ</h2><p>Common questions, grouped by topic. Great if you&apos;d rather read than search.</p>
        <a className="thm-btn" href="/faq"><span className="icon-angles-right" aria-hidden="true" /> Go to FAQ</a>
      </div></div>
      <div className="col-md-6"><div className="contact-two__single edu-feature-card"><div className="contact-two__icon"><i className="fas fa-envelope" aria-hidden="true" /></div>
        <h2 className="contact-two__title">Talk to support</h2><p>Can&apos;t find what you need? We reply within 24 hours, usually a lot sooner.</p>
        <a className="thm-btn" href="/contact"><span className="icon-angles-right" aria-hidden="true" /> Contact us</a>
      </div></div>
    </div></div></section>
  </>;
}
