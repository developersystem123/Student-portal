/* eslint-disable @next/next/no-img-element */

export default function SectionTitle({ eyebrow, children, center = false }: { eyebrow: string; children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`section-title-two ${center ? "text-center" : "text-left"}`}>
      <div className="section-title-two__tagline-box">
        <div className="section-title-two__tagline-shape">
          <img src="/site/assets/images/shapes/section-title-two-shape-1.png" alt="" loading="lazy" decoding="async" />
        </div>
        <span className="section-title-two__tagline">{eyebrow}</span>
      </div>
      <h2 className="section-title-two__title">{children}</h2>
    </div>
  );
}
