import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/store";
import { ToastProvider } from "@/components/ui";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";
import { RESOLVE_THEME_JS, THEME_COOKIE } from "@/lib/theme";

// Outfit is the website's typeface; the portal uses it too so both read as one product.
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Every relative URL in metadata (canonical, Open Graph images) resolves against this origin.
  metadataBase: new URL(SITE_URL),
  title: { default: "EduPortal — Learn Anything, Faster With AI", template: "%s · EduPortal" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["online courses", "AI tutor", "learn online", "certificates", "study helper", "EduPortal"],
  authors: [{ name: SITE_NAME, url: absoluteUrl("/") }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "EduPortal — Learn Anything, Faster With AI",
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "EduPortal — Learn Anything, Faster With AI",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon" },
};

// Organisation + site identity, emitted once for every page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      description: SITE_DESCRIPTION,
      slogan: SITE_TAGLINE,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@eduportal.app",
        areaServed: "Worldwide",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/courses")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

// Runs before first paint so the portal and the preloader (app/loading.tsx) open in the saved theme —
// the same choice the public site uses (lib/theme.ts). The site is server-rendered from the theme
// cookie; with no cookie yet (only the dashboard was used, or the device prefers dark), every site
// page that streams in or is re-rendered on the client is darkened here, until the theme store saves
// the cookie and takes over (components/site/ThemeSwitcher.tsx).
const cookieSet = `/(?:^|; )${THEME_COOKIE}=/.test(d.cookie)`;
const bootTheme = `(function(){try{var t=${RESOLVE_THEME_JS},d=document;
if(t==="dark")d.documentElement.classList.add("dark");
d.documentElement.setAttribute("data-boot-theme",t);
if(t==="dark"&&!${cookieSet}){var o=new MutationObserver(function(){if(${cookieSet})return o.disconnect();
var p=d.querySelector(".site-page:not(.site-dark)");if(p)p.classList.add("site-dark")});
o.observe(d.documentElement,{childList:true,subtree:true})}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: bootTheme }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
