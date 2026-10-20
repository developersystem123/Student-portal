/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, children, center = false }: { eyebrow: string; children: ReactNode; center?: boolean }) {
  return <div className={`section-title-two ${center ? "text-center" : "text-left"} sec-title-animation animation-style2 edu-company-heading`}>
    <div className="section-title-two__tagline-box">
      <div className="section-title-two__tagline-shape"><img src="/site/assets/images/shapes/section-title-two-shape-1.png" alt="" loading="lazy" decoding="async" /></div>
      <span className="section-title-two__tagline">{eyebrow}</span>
    </div>
    <h2 className="section-title-two__title title-animation">{children}</h2>
  </div>;
}

export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return <section className="counter-one edu-company-stats" aria-label="EduPortal in numbers">
    <div className="container"><ul className="counter-one__list list-unstyled edu-company-stats__list">
      {items.map(item => <li key={item.label}><div className="counter-one__count"><strong>{item.value}</strong></div><p>{item.label}</p></li>)}
    </ul></div>
  </section>;
}

export function FeatureGrid({ eyebrow, title, intro, items }: { eyebrow: string; title: string; intro?: string; items: { title: string; description: string; icon?: ReactNode }[] }) {
  return <section className="why-choose-three edu-company-section edu-company-soft">
    <div className="container"><SectionHeading eyebrow={eyebrow} center>{title}</SectionHeading>
      {intro && <p className="edu-company-intro">{intro}</p>}
      <div className="row edu-company-grid">{items.map(item => <div className="col-xl-4 col-md-6" key={item.title}>
        <div className="why-choose-three__feature-single edu-company-card">
          <div className="why-choose-three__feature-img edu-company-card__icon" aria-hidden="true">{item.icon ?? <span className="icon-graduation-cap" />}</div>
          <div className="why-choose-three__feature-content"><h3 className="why-choose-three__feature-title">{item.title}</h3><p className="why-choose-three__feature-text">{item.description}</p></div>
        </div>
      </div>)}</div>
    </div>
  </section>;
}

export function CompanyCta({ title, text, actions }: { title: string; text: string; actions: { label: string; href: string }[] }) {
  return <section className="edu-company-section edu-company-cta"><div className="container">
    <div className="newsletter-two__inner edu-company-cta__inner">
      <div><h2>{title}</h2><p>{text}</p></div>
      <div className="edu-company-actions">{actions.map((action, i) => <a className={`thm-btn${i ? " edu-company-btn-outline" : ""}`} href={action.href} key={action.label}><span className="icon-angles-right" />{action.label}</a>)}</div>
    </div>
  </div></section>;
}
