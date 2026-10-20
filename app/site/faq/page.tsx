import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import SectionTitle from "@/components/site/forms/SectionTitle";
import FAQExplorer from "@/components/site/forms/FAQExplorer";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to the most common questions about EduPortal courses, certificates, payments, refunds and the AI tutor.",
  path: "/faq",
});
// The selected topic and search text live in the query string (?topic=…&q=…) so a filtered view can
// be linked and shared. They are read here, on the server, and passed down — the client component
// would otherwise have to read the URL on mount, which flashes the unfiltered list first.
export default async function FAQPage({ searchParams }: { searchParams: Promise<{ topic?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  return <>
    <PageHeader title="FAQs" parents={[]} />
    <section className="faq-page edu-faq-page"><div className="container">
      <SectionTitle eyebrow="Help Center" center>Frequently asked <span>questions</span></SectionTitle>
      <p className="edu-section-description">Can&apos;t find what you&apos;re looking for? Reach out — we usually reply within 24 hours.</p>
      <FAQExplorer initialTopic={topic ?? ""} initialQuery={query ?? ""} />
      <div className="edu-support-cta"><h2>Still need help?</h2><p>Our support team is happy to help.</p>
        <a href="/contact" className="thm-btn"><span className="icon-angles-right" aria-hidden="true" /> Contact us</a>
      </div>
    </div></section>
  </>;
}
