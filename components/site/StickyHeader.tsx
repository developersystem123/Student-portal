// Converted 1:1 from the site template (index.html). Markup is intentionally untouched so the
// template's CSS and jQuery plugins (Owl, WOW, AOS, GSAP…) bind exactly as in the original.

export default function StickyHeader() {
  return (
    // A labelled landmark of its own: the template copies the main menu in here once it pins, and
    // that copy must not be stray content outside every landmark (it is hidden until it pins).
    <nav className="stricky-header stricked-menu main-menu" aria-label="Main navigation (pinned)">
      <div className="sticky-header__content" />
      {/* /.sticky-header__content */}
    </nav>
  );
}
