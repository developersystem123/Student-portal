// People-free artwork for the site pages: product illustrations rendered from EduPortal UI,
// topic covers per course category, and monogram avatars in place of stock portraits.

const EDU = "/site/assets/images/edu";

const TOPIC_COVERS: Record<string, string> = {
  "Web Dev": "edu-topic-web-dev.png",
  "Data Science": "edu-topic-data-science.png",
  Design: "edu-topic-design.png",
  Business: "edu-topic-business.png",
  Languages: "edu-topic-languages.png",
  Math: "edu-topic-math.png",
};

/** Illustrated cover for a course category; unknown categories get the Web Dev cover. */
export function topicCover(category: string) {
  return `${EDU}/${TOPIC_COVERS[category] ?? TOPIC_COVERS["Web Dev"]}`;
}

const BLOG_COVERS: Record<string, string> = {
  "how-ai-changes-learning": "edu-blog-ai.png",
  "5-habits-of-effective-learners": "edu-blog-habits.png",
  "new-features-spring-2026": "edu-blog-features.png",
  "from-bootcamp-to-job": "edu-blog-job.png",
  "community-meetups-launched": "edu-blog-meetups.png",
};
const BLOG_COVER_LIST = Object.values(BLOG_COVERS);

/** Cover for a blog post by slug, or by position for lists without a slug (press releases). */
export function blogCover(slugOrIndex: string | number) {
  const file = typeof slugOrIndex === "number" ? BLOG_COVER_LIST[slugOrIndex % BLOG_COVER_LIST.length] : BLOG_COVERS[slugOrIndex] ?? BLOG_COVER_LIST[0];
  return `${EDU}/${file}`;
}

// Brand-adjacent tints (background, foreground); every pair clears WCAG AA for the initials.
const TINTS: [string, string][] = [
  ["#DCFCE7", "#166534"],
  ["#D1FAE5", "#065F46"],
  ["#ECFCCB", "#3F6212"],
  ["#FEF3C7", "#92400E"],
  ["#E0F2FE", "#075985"],
];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function initials(name: string, letters: 1 | 2 = 2) {
  const words = name.replace(/^(prof|dr|mr|mrs|ms)\.?\s+/i, "").split(/\s+/).filter((w) => /^\p{L}/u.test(w));
  const first = words[0]?.[0] ?? "?";
  const last = letters === 2 && words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Monogram avatar as an SVG data URI, so it drops into any template <img>.
 * "portrait" fills a tall card (team) and keeps the initials above the card's bottom wave;
 * `letters: 1` suits small avatars stacked with an overlap, where a second letter would be hidden.
 */
export function monogram(
  name: string,
  { width = 120, height = width, portrait = false, letters = 2 }: { width?: number; height?: number; portrait?: boolean; letters?: 1 | 2 } = {},
) {
  const [bg, fg] = TINTS[hash(name) % TINTS.length];
  const text = initials(name, letters);
  const font = "Outfit, 'Segoe UI', system-ui, sans-serif";
  const svg = portrait
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<defs><pattern id="d" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="${fg}" fill-opacity=".14"/></pattern>` +
      `<radialGradient id="g" cx=".8" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>` +
      `<rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#d)"/><rect width="100%" height="100%" fill="url(#g)"/>` +
      `<circle cx="${width / 2}" cy="${height * 0.4}" r="${width * 0.3}" fill="#fff" fill-opacity=".75"/>` +
      `<circle cx="${width / 2}" cy="${height * 0.4}" r="${width * 0.3 + 14}" fill="none" stroke="${fg}" stroke-opacity=".18"/>` +
      `<text x="50%" y="${height * 0.4}" dy=".35em" text-anchor="middle" font-family="${font}" font-weight="600" font-size="${width * 0.22}" fill="${fg}">${text}</text></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<rect width="100%" height="100%" fill="${bg}"/>` +
      `<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="${font}" font-weight="600" font-size="${Math.min(width, height) * 0.38}" fill="${fg}">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
