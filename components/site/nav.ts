// EduPortal site map for the site-styled pages, which next.config.ts serves from the root
// (/about renders app/site/about). Shared by the header, mobile menu, footer and sitemap page.

import type Icon from "@/components/icons";
import type { CourseCategory } from "@/lib/mockData";

export const HOME = "/";

/** A key of the portal icon set (components/icons.tsx). */
export type NavIconName = keyof typeof Icon;

export const NAV_LINKS = [
  { href: HOME, label: "Home" },
  { href: `/courses`, label: "Courses" },
  { href: `/pricing`, label: "Pricing" },
  { href: `/business`, label: "For Business" },
  { href: `/about`, label: "About" },
  { href: `/contact`, label: "Contact" },
];

export const MORE_MENU: {
  title: string;
  items: { href: string; label: string; description: string; icon: NavIconName }[];
}[] = [
  {
    title: "Earn & teach",
    items: [
      { href: `/teach`, label: "Become a Teacher", description: "Share what you know, earn 70% revenue share.", icon: "Award" },
      { href: `/affiliate`, label: "Affiliate program", description: "30% recurring commission on every Pro referral.", icon: "TrendingUp" },
      { href: `/careers`, label: "Careers", description: "Help us build the future of learning.", icon: "Users" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: `/blog`, label: "Blog", description: "Guides, deep-dives, and learning tips.", icon: "Book" },
      { href: `/help`, label: "Help Center", description: "Articles & how-tos, search-first.", icon: "Help" },
      { href: `/faq`, label: "FAQ", description: "Common questions, grouped by topic.", icon: "MessageSquare" },
      { href: `/status`, label: "Service status", description: "Uptime & incident history.", icon: "CheckCircle" },
      { href: `/press`, label: "Press & Media", description: "News, brand kit, and media contacts.", icon: "Megaphone" },
    ],
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: `/courses`, label: "Courses" },
      { href: `/pricing`, label: "Pricing" },
      { href: `/business`, label: "For Business" },
      { href: `/teach`, label: "Become a Teacher" },
      { href: `/affiliate`, label: "Affiliate program" },
      { href: `/about`, label: "About" },
      { href: `/careers`, label: "Careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: `/blog`, label: "Blog" },
      { href: `/help`, label: "Help Center" },
      { href: `/faq`, label: "FAQ" },
      { href: `/testimonials`, label: "Testimonials" },
      { href: `/press`, label: "Press & Media" },
      { href: `/verify`, label: "Verify a certificate" },
      { href: `/status`, label: "Service status" },
    ],
  },
];

export const LEGAL_LINKS = [
  { href: `/terms`, label: "Terms" },
  { href: `/privacy`, label: "Privacy" },
  { href: `/cookies`, label: "Cookies" },
  { href: `/refund`, label: "Refunds" },
  { href: `/accessibility`, label: "Accessibility" },
  { href: `/sitemap`, label: "Sitemap" },
];

// Sign-in and sign-up in the site design; the portal's old /login and /register redirect here.
export const SIGN_IN = `/login`;
export const SIGN_UP = `/register`;
/** "Forgot password?" on the sign-in form, and its pair on the reset form. */
export const FORGOT_PASSWORD = `/forgot-password`;

/** Where each role lands after signing in — the same as the portal's own sign-in page. */
export const PORTAL_HOME = { Admin: "/admin", Instructor: "/teacher", Student: "/dashboard" } as const;

const CATEGORY_ICONS: Record<CourseCategory, number> = {
  "Web Dev": 1,
  "Data Science": 6,
  Design: 2,
  Business: 3,
  Languages: 5,
  Math: 8,
};

/** The course catalogue's categories. Live course counts come from getCategories() in ./data. */
export const COURSE_CATEGORIES = (Object.keys(CATEGORY_ICONS) as CourseCategory[]).map((name) => ({
  name,
  href: `/courses?category=${encodeURIComponent(name)}`,
  icon: `/site/assets/images/icon/categoyr-two-icon-${CATEGORY_ICONS[name]}.png`,
}));

/** Matches the portal Navbar: Home is exact, everything else owns its sub-paths. */
export function isActive(pathname: string, href: string) {
  return href === HOME ? pathname === HOME : pathname === href || pathname.startsWith(`${href}/`);
}
