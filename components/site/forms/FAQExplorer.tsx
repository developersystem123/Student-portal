"use client";

import { useState } from "react";

type FAQ = { category: string; q: string; a: string };
const categories = [
  { id: "all", label: "All" }, { id: "general", label: "Getting started" },
  { id: "courses", label: "Courses" }, { id: "payments", label: "Payments" },
  { id: "certificates", label: "Certificates" }, { id: "account", label: "Account" },
];

const faqs: FAQ[] = [
  { category: "general", q: "What is EduPortal?", a: "EduPortal is an AI-powered learning platform with expert-led courses, interactive quizzes, live classes, and 24/7 AI tutoring across web dev, data science, design, business, and more." },
  { category: "general", q: "Is EduPortal free to use?", a: "Yes — sign-up is free and you'll find many free courses. We also offer paid courses and a Pro plan ($9.99/month) for unlimited AI usage and exclusive content." },
  { category: "general", q: "Who is EduPortal for?", a: "Students, working professionals, and lifelong learners. Whether you're starting from scratch or upskilling, our courses adapt to your level." },
  { category: "courses", q: "How long do I have access to a course?", a: "Once enrolled, you keep lifetime access — including any future updates the instructor publishes." },
  { category: "courses", q: "Are courses self-paced?", a: "Yes. You can pause, rewind, and learn at your own pace. Some live classes happen at scheduled times but recordings are always available." },
  { category: "courses", q: "Can I download videos for offline viewing?", a: "Offline downloads are available for Pro members through our mobile app." },
  { category: "payments", q: "What payment methods do you accept?", a: "Credit/debit cards via Stripe, bank transfers (manual), and scholarship codes. We're adding regional payment methods soon." },
  { category: "payments", q: "Can I get a refund?", a: "Yes — within 14 days of purchase if you've completed less than 25% of the course. See our refund policy for details." },
  { category: "payments", q: "Do you offer discounts?", a: "Yes! Students get 30% off with a valid ID, and we run seasonal promotions. Bundle discounts also apply when buying multiple courses." },
  { category: "certificates", q: "Are certificates recognized?", a: "Certificates are signed and verifiable. Many employers and universities recognize them. We also partner with industry organizations for select tracks." },
  { category: "certificates", q: "How do I earn a certificate?", a: "Complete all chapters, pass the final quiz with the minimum passing score, and submit any required assignments. The certificate is issued automatically." },
  { category: "certificates", q: "Can I share my certificate on LinkedIn?", a: "Absolutely — every certificate comes with a verifiable link and one-click LinkedIn share." },
  { category: "account", q: "How do I reset my password?", a: "Click 'Forgot password' on the login page. We'll email you a reset link valid for 30 minutes." },
  { category: "account", q: "Can I change my email address?", a: "Yes, from Settings → Account. You'll need to verify the new address." },
  { category: "account", q: "How do I delete my account?", a: "Go to Settings → Account → Delete account. This is permanent — your enrollments, certificates, and data will be removed." },
];

const CATEGORY_IDS = categories.map((item) => item.id);

// The chosen topic and search text are mirrored in the URL (?topic=…&q=…) so a filtered view can be
// linked, bookmarked and shared. Updates use replaceState rather than router.replace: the search box
// changes on every keystroke, and a router navigation per keystroke would re-fetch the page each time.
function syncUrl(topic: string, query: string) {
  const params = new URLSearchParams();
  if (topic !== "all") params.set("topic", topic);
  if (query.trim()) params.set("q", query.trim());
  const queryString = params.toString();
  window.history.replaceState(null, "", queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname);
}

export default function FAQExplorer({ initialTopic = "", initialQuery = "" }: { initialTopic?: string; initialQuery?: string }) {
  // The page reads ?topic=…&q=… on the server and passes them in, so the first paint is already
  // filtered (and deep links work) without the client reading the query string on mount.
  const [category, setCategory] = useState(CATEGORY_IDS.includes(initialTopic) ? initialTopic : "all");
  const [search, setSearch] = useState(initialQuery);
  const visible = faqs.filter((faq) => (category === "all" || faq.category === category) && `${faq.q} ${faq.a}`.toLowerCase().includes(search.trim().toLowerCase()));
  const mid = Math.ceil(visible.length / 2);

  return <>
    <div className="edu-search-box">
      <label htmlFor="edu-faq-search">Search questions</label>
      <div className="edu-search-input"><span className="icon-search" aria-hidden="true" /><input type="search" id="edu-faq-search" placeholder="Search questions…" value={search} onChange={(event) => { setSearch(event.target.value); syncUrl(category, event.target.value); }} /></div>
    </div>
    <div className="edu-faq-filters" role="group" aria-label="FAQ topics">
      {categories.map((item) => <button type="button" key={item.id} className={category === item.id ? "edu-filter-active" : ""} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); syncUrl(item.id, search); }}>{item.label}</button>)}
    </div>
    {visible.length ? <div className="row edu-faq-row">
      {[visible.slice(0, mid), visible.slice(mid)].map((column, index) => <div className="col-lg-6" key={index}><div className={index === 0 ? "faq-page__left" : "faq-page__right"}>
        {column.map((faq) => <details className="edu-accordion" key={faq.q}><summary>{faq.q}</summary><div className="edu-accordion-answer"><p>{faq.a}</p></div></details>)}
      </div></div>)}
    </div> : <p className="edu-empty-state" role="status">No questions match your search.</p>}
  </>;
}
