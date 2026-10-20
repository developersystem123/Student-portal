/* eslint-disable @next/next/no-img-element */
// Site template inner-page banner (about.html → section.page-header) with EduPortal breadcrumbs.

import { HOME } from "./nav";

type Crumb = { href?: string; label: string };

type Props = {
  title: string;
  /** Trail between Home and the current page, e.g. [{ href: "/blog", label: "Blog" }]. */
  parents?: Crumb[];
  /** Last breadcrumb; defaults to the title. */
  current?: string;
};

export default function PageHeader({ title, parents = [], current = title }: Props) {
  const trail: Crumb[] = [{ href: HOME, label: "Home" }, ...parents, { label: current }];

  return (
    <section className="page-header">
      <div className="page-header__bg" style={{ backgroundImage: "url(/site/assets/images/shapes/page-header-bg-shape.png)" }} />
      <div className="page-header__shape-4" />
      <div className="container">
        <div className="page-header__inner">
          <div className="page-header__img">
            <span className="page-header__img-art" />
            <div className="page-header__shape-1" />
            <div className="page-header__shape-2" />
            <div className="page-header__shape-3" />
          </div>
          <h1 className="page-header__title">{title}</h1>
          <nav className="thm-breadcrumb__box" aria-label="Breadcrumb">
            <ul className="thm-breadcrumb list-unstyled">
              {trail.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="page-header__crumb">
                  {i > 0 && <span aria-hidden="true">{"//"}</span>}
                  {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span aria-current="page">{crumb.label}</span>}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
