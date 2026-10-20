// Shared shapes for the generated social card and app icons (rendered by next/og ImageResponse).
// Kept here so app/opengraph-image.tsx, app/twitter-image.tsx and app/apple-icon.tsx stay thin.
//
// ImageResponse renders a strict subset of CSS: every element with more than one child needs an
// explicit `display: flex`, there is no grid, and images need an explicit size.

import type { ReactElement } from "react";

/** The brand mark (same artwork as app/icon.svg) inlined so it survives the standalone build. */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient></defs><rect width="1000" height="1000" rx="220" fill="url(#bg)"/><polygon fill="white" points="632.77 555.26 668.98 490.75 673.85 482.51 658.07 482.51 600.31 482.64 760.68 263.12 736.04 263.12 563.77 504 635.54 504 576.84 613.28 594.61 539.4 500 535.58 691.05 263.12 624.92 263.12 499.2 427.16 375.48 263.12 222.88 263.12 405.01 489.82 201.46 736.88 352.99 736.88 499.2 553.68 647.27 736.88 798.54 736.88 632.77 555.26"/></svg>`;

const MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG, "utf8").toString("base64")}`;

const INK = "#0B1220";
const GREEN = "#4ADE80";
const GREEN_DEEP = "#15803D";
const MUTED = "#9CA3AF";

/** 1200×630 social card: brand lockup, headline and the product one-liner. */
export function socialCard(): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: `linear-gradient(135deg, #052E16 0%, ${INK} 62%, #111827 100%)`,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_DATA_URI} width={64} height={64} alt="" style={{ borderRadius: 16 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#FFFFFF" }}>EduPortal</div>
          <div style={{ display: "flex", fontSize: 15, letterSpacing: 5, color: GREEN }}>LEARN · BUILD · GROW</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#FFFFFF" }}>
          Learn Anything,
        </div>
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: GREEN }}>
          Faster With AI.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26 }}>
        <div style={{ display: "flex", color: MUTED }}>Courses · AI tutor · Quizzes · Certificates</div>
        <div style={{ display: "flex", color: GREEN, fontWeight: 600 }}>eduportal.app</div>
      </div>
    </div>
  );
}

/** 180×180 Apple touch icon: the brand mark, edge to edge (iOS applies its own mask). */
export function appIcon(): ReactElement {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: GREEN_DEEP }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MARK_DATA_URI} width={180} height={180} alt="" />
    </div>
  );
}
