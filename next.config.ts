import type { NextConfig } from "next";

// Top-level pages of the public site. Its files live under app/site, but it is served from the
// root: /about renders app/site/about. Portal routes (/dashboard, /admin, /teacher, /api…) are
// never listed here.
const SITE_PAGES =
  "about|accessibility|affiliate|blog|business|careers|contact|cookies|courses|faq|forgot-password|help|login|press|pricing|privacy|refund|register|reset-password|sitemap|status|teach|terms|testimonials|verify";

const nextConfig: NextConfig = {
  output: "standalone",
  // Direct /site links move to the clean URL. Query strings are passed through. The site's static files stay under /site/assets and /site/pages, so only page
  // paths are matched.
  async redirects() {
    return [
      { source: "/site", destination: "/", permanent: false },
      { source: `/site/:page(${SITE_PAGES})/:rest*`, destination: "/:page/:rest*", permanent: false },
    ];
  },
  async headers() {
    // The site template and the portal both ship inline <script>/<style> and inline style
    // attributes, so 'unsafe-inline' is required — the value of the policy is that it pins
    // scripts, images, frames and fonts to known origins, blocking an injected <script src>
    // from another host. 'unsafe-eval' and ws: are development-only (Turbopack HMR).
    const dev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "frame-src 'self'",
      `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Ignored over plain HTTP, so it is safe to always send.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/site" },
        { source: `/:page(${SITE_PAGES})/:rest*`, destination: "/site/:page/:rest*" },
      ],
      afterFiles: [],
      // Anything no route or file matched shows the site's 404. The API and the portal sections keep
      // their own 404 responses.
      fallback: [
        { source: "/:path((?!api/|api$|admin/|admin$|teacher/|teacher$|dashboard/|dashboard$|_next/).*)", destination: "/site/:path" },
      ],
    };
  },
};

export default nextConfig;
