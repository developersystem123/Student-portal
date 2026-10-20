"use client";

import { useState } from "react";

// Each article opens the page that actually answers it — a policy, a self-serve flow, or the matching
// FAQ topic — and says so on the card, rather than every card ending in "Contact support".
type Article = { title: string; description: string; minutes: number; tag: string; href: string; action: string };
type Category = { id: string; icon: string; title: string; description: string; articles: Article[] };
const support = (reason: string) => `/contact?reason=${encodeURIComponent(reason)}`;
const categories: Category[] = [
  { id: "getting-started", icon: "fas fa-star", title: "Getting started", description: "New to EduPortal? Start here.", articles: [
    { title: "Create your account in 60 seconds", description: "Sign up, verify your email, and set your goals.", minutes: 2, tag: "Basics", href: "/register", action: "Create an account" },
    { title: "Choose your first course", description: "How recommendations work and how to pick a path.", minutes: 4, tag: "Basics", href: "/courses", action: "Browse courses" },
    { title: "Set up your learning goals", description: "Daily streaks, study time, and progress reminders.", minutes: 3, tag: "Basics", href: "/faq?topic=general", action: "Read in the FAQ" },
    { title: "Install the mobile app", description: "iOS and Android downloads, plus offline viewing for Pro members.", minutes: 2, tag: "Apps", href: "/faq?topic=courses", action: "Read in the FAQ" },
  ] },
  { id: "courses", icon: "fas fa-book", title: "Courses & learning", description: "Enroll, learn, and complete with confidence.", articles: [
    { title: "How to enroll in a course", description: "Free vs. paid courses and what enrollment unlocks.", minutes: 3, tag: "Enroll", href: "/faq?topic=courses", action: "Read in the FAQ" },
    { title: "Taking quizzes & assignments", description: "What gets graded, retakes, and partial credit.", minutes: 5, tag: "Quizzes", href: "/faq?topic=certificates", action: "Read in the FAQ" },
    { title: "Joining a live class", description: "Calendar invites, links, and recording access.", minutes: 3, tag: "Live", href: "/faq?topic=courses", action: "Read in the FAQ" },
    { title: "Earning a certificate", description: "Completion criteria and verification.", minutes: 4, tag: "Certs", href: "/verify", action: "Verify a certificate" },
  ] },
  { id: "ai", icon: "fas fa-comment-dots", title: "AI tools", description: "Chat tutor, quiz generator, assignment helper.", articles: [
    { title: "How the AI tutor works", description: "Context, limits, and tips for better answers.", minutes: 5, tag: "Chat", href: "/faq?topic=general", action: "Read in the FAQ" },
    { title: "Generating practice quizzes", description: "From any topic — text, PDF, or link.", minutes: 3, tag: "Quizzes", href: "/pricing", action: "See what Pro includes" },
    { title: "Assignment helper guidelines", description: "What it will and won't do (academic integrity).", minutes: 4, tag: "Assist", href: "/terms", action: "Read the terms" },
    { title: "Daily AI usage limits", description: "Free vs. Pro and how to monitor your usage.", minutes: 2, tag: "Limits", href: "/pricing", action: "Compare plans" },
  ] },
  { id: "billing", icon: "fas fa-credit-card", title: "Billing & payments", description: "Plans, invoices, and refunds.", articles: [
    { title: "Upgrading to Pro", description: "Monthly or annual — what changes immediately.", minutes: 3, tag: "Plans", href: "/pricing", action: "Compare plans" },
    { title: "Update your payment method", description: "Cards, regional methods, and SCA in Europe.", minutes: 2, tag: "Payment", href: "/faq?topic=payments", action: "Read in the FAQ" },
    { title: "Download an invoice", description: "Past invoices, VAT, and business billing details.", minutes: 2, tag: "Invoice", href: support("General question"), action: "Ask support" },
    { title: "Request a refund", description: "Our 14-day refund policy and how to apply.", minutes: 3, tag: "Refunds", href: "/refund", action: "Read the refund policy" },
  ] },
  { id: "account", icon: "fas fa-user-shield", title: "Account & security", description: "Login, passwords, and account safety.", articles: [
    { title: "Reset your password", description: "Link expiry and what to do if it doesn't arrive.", minutes: 2, tag: "Login", href: "/forgot-password", action: "Reset your password" },
    { title: "Enable two-factor authentication", description: "Recommended for everyone — takes 60 seconds.", minutes: 3, tag: "Security", href: "/faq?topic=account", action: "Read in the FAQ" },
    { title: "Change your email address", description: "Verification, side effects, and downtime.", minutes: 2, tag: "Account", href: "/faq?topic=account", action: "Read in the FAQ" },
    { title: "Delete your account", description: "What gets removed and what's retained for legal reasons.", minutes: 4, tag: "Account", href: "/privacy", action: "Read the privacy policy" },
  ] },
  { id: "teach", icon: "fas fa-award", title: "For instructors", description: "Teaching, payouts, and the authoring studio.", articles: [
    { title: "Apply to teach on EduPortal", description: "What we look for and how the review works.", minutes: 4, tag: "Apply", href: "/teach", action: "Apply to teach" },
    { title: "Authoring studio basics", description: "Chapters, captions, quizzes, and assignments.", minutes: 6, tag: "Tools", href: "/teach", action: "See how teaching works" },
    { title: "Getting paid", description: "Payout schedule, methods, and tax forms.", minutes: 4, tag: "Payouts", href: support("General question"), action: "Ask support" },
    { title: "Promote your course launch", description: "Co-marketing, banners, and discount codes.", minutes: 5, tag: "Growth", href: "/affiliate", action: "See the affiliate program" },
  ] },
];
const ARTICLE_COUNT = categories.reduce((sum, category) => sum + category.articles.length, 0);
const popular = [
  { href: "#getting-started", label: "How do I get started?" },
  { href: "#billing", label: "Cancel my subscription" },
  { href: "#ai", label: "AI usage limits" },
  { href: "#courses", label: "Download a certificate" },
  { href: "#account", label: "Reset password" },
  { href: "/refund", label: "Refund policy" },
];

// The search text is mirrored in the URL (?q=…) so a specific search can be linked and shared.
// replaceState rather than router.replace: this input changes on every keystroke.
function syncUrl(query: string) {
  const trimmed = query.trim();
  window.history.replaceState(null, "", trimmed ? `${window.location.pathname}?q=${encodeURIComponent(trimmed)}` : window.location.pathname);
}

export default function HelpExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  // The page reads ?q=… on the server and passes it in, so a shared search link paints already filtered.
  const [query, setQuery] = useState(initialQuery);
  const filtered = query.trim() ? categories.map((category) => ({ ...category,
    articles: category.articles.filter((article) => `${article.title} ${article.description}`.toLowerCase().includes(query.trim().toLowerCase())),
  })).filter((category) => category.articles.length) : categories;
  const matched = filtered.reduce((sum, category) => sum + category.articles.length, 0);

  return <>
    <div className="edu-search-box edu-help-search"><label htmlFor="edu-help-query">Search {ARTICLE_COUNT} articles, or browse by topic. Most answers are 3 minutes away.</label>
      <div className="edu-search-input"><span className="icon-search" aria-hidden="true" /><input type="search" id="edu-help-query" placeholder="Search for an article…" value={query} onChange={(event) => { setQuery(event.target.value); syncUrl(event.target.value); }} /></div>
      {query.trim() ? <p className="edu-search-count" role="status">{matched} {matched === 1 ? "article" : "articles"} match “{query}”</p> : <div className="edu-popular"><span>Popular:</span>{popular.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}</div>}
    </div>
    <div className="edu-help-categories">
      {filtered.length ? filtered.map((category) => <section id={category.id} className="edu-help-category" key={category.id}>
        <div className="edu-help-category-heading"><div className="contact-two__icon"><i className={category.icon} aria-hidden="true" /></div><div><h2>{category.title}</h2><p>{category.description}</p></div></div>
        <ul className="row list-unstyled">{category.articles.map((article) => <li className="col-xl-3 col-md-6" key={article.title}>
          <a className="edu-article-card" href={article.href}>
            <span className="edu-article-meta"><span className="edu-article-tag">{article.tag}</span><span><i className="far fa-clock" aria-hidden="true" /> {article.minutes} min</span></span>
            <strong>{article.title}</strong><span className="edu-article-description">{article.description}</span><span className="edu-article-action">{article.action} <i className="icon-angles-right" aria-hidden="true" /></span>
          </a>
        </li>)}</ul>
      </section>) : <div className="edu-empty-state" role="status"><h2>No articles match “{query}”</h2><p>Try different keywords, or <a href="/contact">contact support</a>.</p></div>}
    </div>
  </>;
}
