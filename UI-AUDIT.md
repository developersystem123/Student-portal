# EduPortal public site: UI and functionality audit

Date: 16 Oct 2026. Scope: all 26 public pages plus 2 types of 404, each in desktop light (1440), desktop dark, tablet (768) and mobile (375). That is 112 page-variants in total.

The method:
- A Playwright crawl with axe-core accessibility checks.
- A count of console errors, network failures, overflow, broken images, link status, SEO tags and page weight.
- Manual functional testing (search, menus, forms, theme, keyboard).
- A visual design review of every screenshot.

Content issues are tracked in `WEBSITE-AUDIT.md`: fake stats and testimonials, dollar prices, junk test data, placeholder emails and so on. They are **not repeated here**, apart from where they break the UI.

Priority key:
- **P0** means it blocks launch.
- **P1** means it should be fixed before launch.
- **P2** is polish.

---

## What already passes ✅
- No horizontal overflow at 375, 768 or 1440 on any page.
- No broken images, and no failed network requests apart from the expected 404s.
- All 60 internal links resolve.
- Every page has a unique `<title>` and meta description, apart from the course 404, which has no description. Every page except home has exactly one `<h1>`.
- Every `<img>` has `alt`.
- Course filters, search and pagination work with plain URLs and need no JS.
- The FAQ accordion (`<details>`) and the pricing monthly/annual toggle work.
- The dark theme persists across reloads through a cookie, and the toggle has `role=switch` with `aria-checked`.
- Login and register validation works and shows inline errors. The password show/hide toggle works.

---

## 1. Global visual problems (seen on every page)

| # | P | Problem | Where | Fix |
|---|---|---|---|---|
| G1 | P0 | **Vertical green social bar overlaps and clips the logo.** The words "facebook // instagram // linkedin // twit…" are cut off, run behind the "X" logo, and a purple squiggle crosses the wordmark. All four links are `href="#"`. | `components/site/PageHeader.tsx:29-33` | Remove the bar, or move it below the header with real links. |
| G2 | P0 | **Green half-circle "blob" on every pill button.** Get started, Sign in, Subscribe, Send, Verify and Enroll all show it. This is the template's hover-fill `::before`, visible at rest, and it looks like a rendering glitch. "View course" and "Send message" also get a diagonal two-tone split. | `.thm-btn::before` in `public/site/assets/css/style.css` and module CSS | Hide `::before` until hover, or drop the effect. Define one primary, one secondary and one ghost button style. |
| G3 | P1 | **Inner-page hero ("page header") is weak and repeated.** It shows the same student illustration on every page. The title sits far left above an empty middle. **Long titles run under the illustration and get cut off**, for example "Full-Stack Web Development with N…" on course detail and the blog article. The illustration circle reaches up behind the Sign in button. | `PageHeader.tsx` and page-header CSS | Clamp the title width to the left column (max ~60%) or wrap it. Use a smaller, page-specific illustration, or none. |
| G4 | P1 | **Typography mixes fonts.** Italic serif is used for section eyebrows, meta rows, "Browse courses" and "No credit card", curriculum "Module 1", and blog meta, against the geometric sans (Outfit) everywhere else. The eyebrow's green dot overlaps the first letter ("•About Us"). Heading case varies between Title Case ("We're Here To Help And Ready To Hear From You") and sentence case. | Global CSS (`section-title__tagline` and similar) | Use one sans family with a tight type scale and sentence case everywhere. Keep the serif for at most one display accent. |
| G5 | P1 | **Dark mode was not themed completely.** See section 3 for the full list. | Dark CSS (`:where(.site-dark)`) | Audit each component and use tokens instead of hard-coded whites. |
| G6 | P1 | **Footer.** The large outlined "Contact Us" text sits right under the tagline and nearly touches it. The left column has a big empty area. The App Store and Google Play badges link to `#`, and there are no apps. In dark mode the footer is the same navy as the page, so there is no edge. | `components/site/SiteFooter.tsx` | Remove the outline display text and the app badges. Give the dark footer its own surface colour plus a top border. |
| G7 | P1 | **Brand green fails contrast for text.** `#16a34a` on white is 3.29:1 (AA needs 4.5:1) and is used for links, labels, prices and eyebrows. Axe found **348 contrast failures on 28 page-variants.** | Theme variables | Use a darker green such as `#15803d` (5.0:1) for text. Keep `#16a34a` for fills and large text only. |
| G8 | P2 | Small grey secondary text (11–13px) is everywhere: card meta, terms and consent lines, help metadata, the "Last updated" line. | Global | Use 14px minimum for meta and 16px for body. |
| G9 | P2 | Grids leave orphan cards and uneven card heights: blog 3+2, press 3+2 and 2+2+1, help, sitemap, FAQ, testimonials "More stories". CTA links inside cards sit at different heights. | Many pages | Use equal-height cards (`display:flex; flex-direction:column`, CTA `margin-top:auto`) and item counts that fill the grid. |
| G10 | P2 | Highlighted words inside headings leave odd gaps or stray dots: "Talk To A ·", "entire team , in one", "how people learn .", and on about "useful  learning companion" has a double space. | Contact, business, about and other headings | Remove the extra spaces and the decorative dot pseudo-element. |

## 2. Page-specific visual problems

**Home**
- No `<h1>` on the page. The marquees repeat `<h2>`s.
- In the hero card:
  - "AI-powered learning/" has a stray slash, there are 4 stars, and an "SI" badge overlaps the card.
  - "No credit card" is styled like a button but isn't clickable.
- Stat text:
  - "1200K+ Active learners" is a wrong number format.
  - The marquee shows "0+ Expert-Led Courses" until the counter animates.
- Carousels:
  - They cut cards in half at the edges: instructors (".ucía Ramírez"), blog, and "Pick your path".
  - "Popular this week" is offset from the container gutter.
  - The course pager "01 02 03" is shown even when all cards already fit.
- Rating stars don't match the number: a 5.0 rating shows 3 gold stars.
- Outlined numbers and text are hard to read: "1200K+ 850+ 94%", "Ready to learn smarter?", "LIVE VIDEO" is clipped.
- The testimonial avatar "AK" doesn't match the name "Marco D.", and the pager dots look broken.
- The live-class section shows fake video-call controls.
- Page weight: **208 requests, ~9 MB, 198 images, none lazy-loaded.**

**Courses**
- The card shows two button rows, tiny meta and a hairline divider, so it feels crowded.
- The sidebar ends early, leaving an empty left column beside rows 2–3.
- Category and level counts ignore the active filters.

**Course detail**
- **The enroll card is broken.** "$49" is overlapped by the Enroll button, "Enroll online" wraps onto 2 lines, and "Apply for in-person classes" is squeezed next to it. This happens on desktop and mobile.
- The title appears twice: once cut off in the hero, then again below the image.
- The tabs row (Overview, Curriculum, Instructor, Reviews) sticks to the meta row and has no active state. On mobile it wraps to 2 lines.
- Curriculum rows read "Module 1 : 01", with a stray floating colon and a serif/sans mix.
- The same photo is used large and as the sidebar thumbnail.
- Reviews: "4 reviews" shows 5 gold stars next to "Average rating: 4 out of 5". "Student reviews 4" and "Rating 4/5" side by side are confusing.
- On mobile the price and Enroll card come **after** the whole curriculum. There is no sticky enroll bar, so the main CTA is ~4 screens down.

**Blog list and article**
- The date tab overlaps and clips the thumbnail art ("2026 release" is cut).
- Thumbnail styles are inconsistent.
- The article has only one related post, which leaves an empty area.
- The featured image is a blown-up UI mock with huge type.

**Contact**
- **The "Visit our HQ" map is an empty grey box.** In dark mode it is a bright patch. The OSM iframe also logs a `postMessage` origin warning.
- The consent text is tiny and wraps awkwardly beside the button.

**Pricing**
- The Pro card's badge pushes it down, so prices, features and CTAs don't line up across the 3 cards.
- The price sits in a heavy solid green circle, centred, while everything else is left-aligned.
- The FAQ uses an "↑" arrow as its collapsed icon.

**Login and register**
- The title repeats: the hero says "Sign in", then "Welcome Back"; or "Create account", then "Create Your EduPortal Account".
- The tall hero pushes the form below the fold. Auth pages would be better as a focused, minimal layout.
- The demo-credentials box (monospace, "Use" pills) looks off-brand. It should not exist in production at all.

**Status**
- "Service Status" is followed by "EduPortal Service Status", so the title repeats.
- All 8 uptime bars are identical clones, with no legend or tooltip.

**Sitemap**
- Only 2 of 5 cards have header icons, so the titles are misaligned.
- The second row is 2 cards in a 3-column grid.

**Legal pages (privacy, terms, cookies, refund, accessibility)**
- The sticky table of contents (`max-height:770px; overflow:auto`) **doesn't stay visible**: the left column goes blank once you scroll.
- Lists are typed as text ("- ", "·", "1.") instead of `<ul>` and `<ol>`.
- Cookie names should be a table.
- The intro callout is larger than the body text, which inverts the hierarchy.
- The breadcrumb reads "Terms Of Service".

**Business, careers, teach, affiliate, help, verify, press, testimonials**
- Dark-mode icon tiles glare (see section 3).
- On the affiliate page (light mode) the tier circles show "0+ / 25+ / 100+" in dark green on bright green, which is nearly invisible.
- Help-centre cards all end with "Contact support »" rather than real articles.
- On press, the "Press release" tag looks like an input box.
- On teach and affiliate, the submit is a pill plus a detached circle.
- The verify form card has dead space, no helper text (for example where to find the code), and the button sits a few px lower than the input.

**404 pages**
- The **unknown-URL 404** (`/anything`) renders the *portal's* 404. It has a different design, no site header or footer, ignores dark mode, and loads a different stylesheet. The site's own 404 exists at `app/site/not-found.tsx` but only shows for `/courses/<bad-slug>`.
- The site 404:
  - "Back to home" and "Explore courses" touch with no gap.
  - The body stays white in dark mode.
  - The off-brand blue and pink robot illustration doesn't fit the palette.
  - The page has no meta description.

## 3. Dark mode specifically

Some text is invisible, and some light surfaces don't change colour:
- Course detail:
  - **the "What you will learn" list text is invisible** (only the check icons show);
  - curriculum rows are solid white cards.
- Courses: the sidebar search input stays white.
- Blog: the category label in the post meta is invisible.
- Blog article:
  - topic pills are white with invisible text;
  - the category bar is white;
  - "Like this post?" is dark on dark.
- Pricing: FAQ question text is very faint.
- Verify: the section heading may be invisible.
- Icon tiles and circles stay bright mint or white on business, help, teach, affiliate and about. The status pills ("Operational", "Minor") glare.
- The illustration keeps its white blob and purple circle, and the hero loses its pattern.
- The 404 body stays white, and the portal 404 ignores dark mode entirely.
- The footer has no separation from the page.

## 4. Functionality problems

| # | P | Problem | Fix |
|---|---|---|---|
| F1 | P0 | **Preloader blocks the page.** It waits for `window.load` + 1.2s, which took ~11s on home in dev. **With JS disabled the site stays blank**: `.js-preloader` is `display:flex; z-index:20000` forever. | Remove the preloader, or hide it with CSS by default and cap it at ~400ms. |
| F2 | P0 | **The unknown-URL 404 is the portal page** (see section 2). | Add a catch-all that renders the site's not-found, or style the root `app/not-found.tsx` like the site. |
| F3 | P1 | **Search popup.** The toggle is `href="#"`. Focus doesn't move into the input. **Escape doesn't close it.** The placeholder promises "topics, instructors", but only titles match (an instructor search returns 0). | Use a `<button>`, focus the input, close on Escape, and either search instructors or change the placeholder. |
| F4 | P1 | **The "More" menu link is `href="#"`.** A click jumps to the top and adds `/#` to the URL. | Use a `<button aria-expanded>`. |
| F5 | P1 | **Mobile nav.** Focus doesn't move into it, there is no focus trap, and Escape doesn't close it. The close control is a `<span>`. Its social links are `#`. **Sign in and Get started are hidden on mobile**, so a phone user can't find them without opening the menu. | Use a proper dialog pattern and show a compact Sign in button in the mobile header. |
| F6 | P1 | **Footer newsletter (every page).** The input has no `name` and no label. Submitting just reloads the page with no feedback. | Wire it to an API with success and error messages, or remove it. |
| F7 | P1 | **Course detail "Enroll online"** goes to `/register` and loses the chosen course. Login has no `?next=` support, so after signing in the user lands on the dashboard, not the course. | Pass `?next=/courses/slug` through login and register. |
| F8 | P1 | **"Forgot password" goes to `/contact`.** There is no reset flow. | Build email-based reset. |
| F9 | P1 | **Register still offers the "Admin" role** in the role select. | Remove it. Admins should be created only by admins. |
| F10 | P1 | Login says "No account found with this email.", which lets anyone check whether an email is registered. | Use one generic message: "Email or password is incorrect". |
| F11 | P1 | **Every page preloads the 404 illustration** (`error-page-img1.png`) and page-header shapes it doesn't use. This is a console warning on 101 of 112 page-variants. | Find out why `not-found` assets are preloaded (React 19 image preload from the not-found boundary) and use CSS backgrounds or lazy-load them. |
| F12 | P2 | Verify page: the result isn't kept in the URL (it can't be shared or bookmarked), and the code lookup is case-sensitive. | `?code=` in the URL; normalise case. |
| F13 | P2 | FAQ and help category filters aren't in the URL. | Put them in a query param. |
| F14 | P2 | Contact form name and email have no `autocomplete`. | `autocomplete="name"`, `"email"`. |
| F15 | P2 | Register errors use `role=alert` and are announced on every keystroke. | Announce only on submit or blur. |
| F16 | P2 | "Remember me" on login does nothing. | Make it control the session lifetime, or remove it. |

## 5. Accessibility (axe-core results plus keyboard tests)

| Rule | Impact | Page-variants | Detail |
|---|---|---|---|
| color-contrast | serious | 28/56 | 348 nodes, mainly brand-green text (see G7) |
| link-name | serious | 23/56 | 234 links with no text: app badges, `#` social icons, carousel links |
| region | moderate | 28/56 | Header content isn't inside a `<header>` or `<nav>` landmark |
| heading-order | moderate | 23/56 | Skipped levels; cloned Owl carousel items duplicate headings |
| button-name | critical | home | 32 Owl prev/next buttons have no label |
| list / listitem | serious | home | The marquee `<ul>` is broken by the jQuery marquee wrapper |
| aria-prohibited-attr | serious | business | `aria-label` on a plain `<div>` for star ratings |
| link-in-text-block | serious | business | A green link in a paragraph is 1.46:1 against the text, with no underline |

Keyboard and motion:
- There is no "Skip to content" link.
- "Get started free" and the nice-select dropdowns have no visible focus ring.
- Off-screen cloned carousel cards are focusable, so Tab goes into invisible content.
- **`prefers-reduced-motion` is ignored**: 119 animations still run (marquees, floating images, WOW/GSAP) and the custom cursor stays on.

## 6. Performance

- **Every page loads 53 CSS files and 41–43 JS files** (~120 requests). Home makes 208 requests (~9 MB transfer in dev). That includes the whole template bundle: jQuery, jquery-ui (458 KB unminified), Owl, GSAP, WOW, odometer, nice-select, and more, even on pages that use none of it.
- Images:
  - Images are huge. `site-footer-shape-bg.png` is 1.3 MB and is on every page; `edu-video-lesson.png` is 869 KB; `banner-one-bg-shape-1.png` is 807 KB; `edu-art-contact-support.png` is 762 KB. The images folder is 21 MB in total.
  - Blog thumbnails are 1242px wide but shown at 366px.
  - None of the 119+ `<img>` tags have width/height or `loading="lazy"`, so layout shifts and everything downloads up front.
- Icon fonts use `font-display: block`, so text is invisible while they load.
- Every page is dynamic: the layout reads cookies, and `getCourses()` is uncached. Marketing pages can't be statically cached.
- Home has ~3,760 DOM nodes, mostly from duplicated carousels and marquees.

Fix: load template CSS and JS per page, or rewrite the few widgets used in React and drop jQuery. Convert images to WebP or AVIF at display size (`next/image`, or pre-resized). Set `loading="lazy"` with width and height. Use `font-display: swap`. Cache course data (`"use cache"` or revalidate), and move the theme read to the client so pages can be static.

## 7. SEO and sharing

- Missing everywhere: Open Graph and Twitter tags, canonical URL, `metadataBase` and JSON-LD (Organization, Course, Article).
- These return 404: `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/apple-touch-icon.png` and the web manifest.
- Home has no `<h1>`.
- Course pages work at both `/courses/<id>` and `/courses/<slug>`, which creates duplicate content. Use a canonical tag or redirect one to the other.
- The course 404 has no meta description.

## 8. Reliability and errors

- There is no `error.tsx`, `global-error.tsx` or `loading.tsx` for the site. A server error shows Next's default page.
- When the database is down the site **silently falls back to mock data**, so visitors see fake courses with no warning.
- `/api/auth/me` has no try/catch.
- Raw error text reaches users ("Failed to fetch", `lib/auth-server.ts:73`).
- `script.js` (template jQuery) mutates DOM that React owns: it clones the header and toggles `current` classes. This risks hydration errors and stale menus. Two separate theme systems exist (portal and site).

## 9. Security (needs fixing before real users)

- No rate limiting on login, register or contact. Brute force and spam are possible.
- **A hard-coded fallback `SESSION_SECRET`** is in `lib/session.ts:13`. If the env var is missing, anyone can forge sessions.
- Session tokens have no expiry or revocation.
- **Plaintext legacy passwords are still accepted** (`lib/password.ts:76-77`).
- There is no CSRF protection on login.
- No security headers: CSP, HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy are all missing.
- The demo login credentials are shown on the login page.

---

## Suggested order of work

1. **Launch blockers (P0):**
   - Fix the social bar overlapping the logo (G1).
   - Remove the button blob (G2).
   - Fix the preloader (F1).
   - Make the unknown-URL 404 use the site design (F2).
   - Fix the enroll card on course detail.
   - Fix invisible dark-mode text.
   - Fix the empty map.
   - Security items in section 9.
2. **Design consistency (P1):**
   - One type system and button system.
   - Rework the page header (G3–G4).
   - Full dark-mode pass.
   - Footer cleanup.
   - Brand-green contrast token.
3. **Functionality (P1):**
   - Search popup, More menu, mobile nav and newsletter.
   - `?next=` redirect, password reset, remove the Admin role, generic login error.
4. **Performance and SEO:**
   - Per-page assets and compressed images.
   - Lazy-loaded images.
   - robots, sitemap, favicon and OG tags.
   - Caching.
5. **Accessibility polish:**
   - Skip link, focus rings, reduced motion, carousel clones, landmarks.

Status of items in `WEBSITE-AUDIT.md`:
- Resolved: #26 and #27 (site served at `/`) and #1 (address unified to Faisalabad).
- Partly resolved: #49 (phone added).
- Note: row 12 of that file contains an accidental paste ("### Today's Work Plan …") that should be removed.
