// 404 artwork in the site's illustration style: the "0" is a compass that has lost its way, a graduation cap
// rests on the second "4", and a book chip sits on the learning path. Colours come from the --nf-* variables
// in pages/content.css so the art follows the light and dark themes.
const FOUR = "M108 60H150V180H180V218H150V260H108V218H20V182L108 60ZM108 119V180H64Z";

export default function NotFoundArt() {
  return (
    <svg className="edu-404-art" viewBox="0 0 560 320" width={560} height={320} aria-hidden="true" focusable="false">
      <circle cx="280" cy="160" r="150" fill="var(--nf-mint)" />
      <ellipse cx="280" cy="296" rx="236" ry="12" fill="var(--nf-mint-2)" />

      {/* Learning path from the book chip to the compass */}
      <path d="M62 56C120 8 196 12 232 64" fill="none" stroke="var(--nf-line)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11" />
      <circle cx="40" cy="76" r="26" fill="var(--nf-mint-2)" />
      <path d="M26 68q7-4 14 0v17q-7-4-14 0zM40 68q7-4 14 0v17q-7-4-14 0z" fill="var(--nf-green)" />

      <path d={FOUR} fill="var(--nf-green)" fillRule="evenodd" stroke="var(--nf-green)" strokeWidth="6" strokeLinejoin="round" />
      <path d={FOUR} transform="translate(360 0)" fill="var(--nf-green)" fillRule="evenodd" stroke="var(--nf-green)" strokeWidth="6" strokeLinejoin="round" />

      {/* The "0": a compass */}
      <circle cx="280" cy="160" r="80" fill="var(--nf-surface)" stroke="var(--nf-green)" strokeWidth="36" />
      <path d="M280 108v8M280 204v8M228 160h8M324 160h8" stroke="var(--nf-tick)" strokeWidth="4" strokeLinecap="round" />
      <g className="edu-404-art__needle">
        <path d="M280 112L293 160H267Z" fill="var(--nf-needle)" />
        <path d="M267 160H293L280 208Z" fill="var(--nf-amber)" />
      </g>
      <circle cx="280" cy="160" r="7" fill="var(--nf-surface)" stroke="var(--nf-needle)" strokeWidth="4" />

      {/* Graduation cap on the second "4" */}
      <g transform="rotate(-10 489 50)">
        <path d="M455 46V64q34 14 68 0V46Z" fill="var(--nf-cap-band)" />
        <path d="M489 22L549 40L489 58L429 40Z" fill="var(--nf-cap)" />
        <path d="M489 40L541 46V78" fill="none" stroke="var(--nf-amber)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="536" y="76" width="10" height="16" rx="3" fill="var(--nf-amber)" />
      </g>
      <path d="M520 14l-4-10M536 18l6-9M546 30l10-3" stroke="var(--nf-amber)" strokeWidth="3" strokeLinecap="round" opacity=".7" />

      {/* Leaves */}
      <g transform="translate(46 294)">
        <path d="M0 0C-8-26 2-50 22-66C28-40 20-16 0 0Z" fill="var(--nf-leaf)" />
        <path d="M0 0C-14-18-32-28-50-28C-42-10-22 0 0 0Z" fill="var(--nf-green)" />
      </g>
      <g transform="translate(524 294) scale(-1 1)">
        <path d="M0 0C-8-22 0-42 16-56C22-34 16-14 0 0Z" fill="var(--nf-green)" />
        <path d="M0 0C-12-16-28-24-44-24C-36-8-18 0 0 0Z" fill="var(--nf-leaf)" />
      </g>
    </svg>
  );
}
