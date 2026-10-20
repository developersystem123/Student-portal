import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { NAV_LINKS, MORE_MENU, FOOTER_COLUMNS, LEGAL_LINKS } from "@/components/site/nav";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Sitemap",
  description: "Every public page on EduPortal, in one place.",
  path: "/sitemap",
});
const siteLinks = [...NAV_LINKS, ...MORE_MENU.flatMap(group => group.items), ...FOOTER_COLUMNS.flatMap(column => column.links), ...LEGAL_LINKS];
function href(label: string) { const match = siteLinks.find(link => link.label.toLowerCase() === label.toLowerCase()); if (!match) throw new Error(`Missing site link: ${label}`); return match.href; }
const sections = [
  { title: "Product", icon: "icon-graduation-cap", links: [
    { href: href("Home"), label: "Home", description: "Landing & overview" }, { href: href("Courses"), label: "Courses", description: "Full catalog" }, { href: href("Pricing"), label: "Pricing", description: "Plans & comparison" }, { href: href("For Business"), label: "For Business", description: "Teams & enterprise" }, { href: href("Become a Teacher"), label: "Become a Teacher", description: "Apply to teach" },
  ] },
  { title: "Company", icon: "icon-globe", links: [
    { href: href("About"), label: "About", description: "Our story & team" }, { href: href("Careers"), label: "Careers", description: "Open roles" }, { href: href("Press & Media"), label: "Press & Media", description: "News and brand kit" }, { href: href("Contact"), label: "Contact", description: "Get in touch" }, { href: href("Testimonials"), label: "Testimonials", description: "Stories from learners" },
  ] },
  { title: "Resources", icon: "icon-book", links: [
    { href: href("Help Center"), label: "Help Center", description: "Articles & how-tos" }, { href: href("FAQ"), label: "FAQ", description: "Frequently asked questions" }, { href: href("Blog"), label: "Blog", description: "Articles & guides" }, { href: href("Affiliate program"), label: "Affiliate Program", description: "Earn while sharing" }, { href: href("Service status"), label: "Service Status", description: "Uptime & incidents" },
  ] },
  { title: "Account", icon: "icon-user-plus", links: [
    { href: "/login", label: "Sign in", description: "Returning learners" }, { href: "/register", label: "Create account", description: "Free to start" }, { href: "/dashboard", label: "Student dashboard", description: "Continue learning (signed-in)" }, { href: "/teacher", label: "Teacher portal", description: "For instructors" }, { href: "/admin", label: "Admin console", description: "For administrators" },
  ] },
  { title: "Legal", icon: "icon-stamp", links: [
    { href: href("Terms"), label: "Terms of Service" }, { href: href("Privacy"), label: "Privacy Policy" }, { href: href("Cookies"), label: "Cookie Policy" }, { href: href("Refunds"), label: "Refund Policy" }, { href: href("Accessibility"), label: "Accessibility Statement" },
  ] },
];
export default function SitemapPage() { const totalLinks = sections.reduce((sum, section) => sum + section.links.length, 0); return <>
  <PageHeader title="Sitemap" parents={[]} />
  <section className="edu-content-section edu-sitemap"><div className="container"><div className="section-title text-center"><div className="section-title__tagline-box"><div className="section-title__tagline-shape" /><span className="section-title__tagline">Sitemap</span></div><h2 className="section-title__title">Every page, in one place</h2><p className="edu-section-intro">A quick overview of {totalLinks} public pages. If you&apos;re looking for something specific, try the search in our <a href={href("Help Center")}>Help Center</a>.</p></div>
    {/* Four equal columns, then the short legal links as one full-width strip — five cards in a
        three-column grid left a half-empty second row. */}
    <div className="row edu-sitemap__grid">{sections.map(section => <div className={section.title === "Legal" ? "col-12" : "col-xl-3 col-md-6"} key={section.title}><div className={`sidebar__single sidebar__category edu-sitemap__card${section.title === "Legal" ? " edu-sitemap__card--strip" : ""}`}><div className="sidebar__title-box"><div className="sidebar__title-icon" aria-hidden="true"><span className={section.icon} /></div><h2 className="sidebar__title">{section.title}</h2></div><ul className="sidebar__category-list list-unstyled">{section.links.map(link => <li key={link.href}><a href={link.href}><span className="edu-sitemap__link"><strong>{link.label}</strong>{"description" in link && link.description && <small>{link.description}</small>}</span><span className="fas fa-arrow-right" aria-hidden="true" /></a></li>)}</ul></div></div>)}</div>
  </div></section>
</>; }
