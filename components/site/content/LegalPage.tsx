import PageHeader from "@/components/site/PageHeader";

import type { ReactNode } from "react";

/** Optional structured data shown after the section copy, e.g. the list of cookies. */
export type LegalTable = { caption: string; head: string[]; rows: string[][] };
export type Section = { id: string; title: string; body: string; table?: LegalTable };

/** `**bold**` and `code` inside a line of policy copy. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, j) => part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part.startsWith("`") && part.endsWith("`") ? <code key={j}>{part.slice(1, -1)}</code> : <span key={j}>{part}</span>);
}

const BULLET = /^[-•·] +/;
const NUMBER = /^\d+\. +/;

/** A paragraph whose every line starts with a bullet or a number is a real list, not typed-out text. */
function block(paragraph: string, key: number) {
  const lines = paragraph.split("\n").map(line => line.trim()).filter(Boolean);
  if (lines.length > 1 && lines.every(line => BULLET.test(line))) return <ul key={key}>{lines.map((line, i) => <li key={i}>{inline(line.replace(BULLET, ""))}</li>)}</ul>;
  if (lines.length > 1 && lines.every(line => NUMBER.test(line))) return <ol key={key}>{lines.map((line, i) => <li key={i}>{inline(line.replace(NUMBER, ""))}</li>)}</ol>;
  return <p key={key}>{inline(paragraph)}</p>;
}

/** The first column names the row (a cookie name, say); each cell carries its column name for the stacked phone layout. */
function PolicyTable({ table }: { table: LegalTable }) {
  return <div className="edu-legal__table-wrap" role="region" aria-label={table.caption} tabIndex={0}>
    <table className="edu-legal__table">
      <caption>{table.caption}</caption>
      <thead><tr>{table.head.map(cell => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
      <tbody>{table.rows.map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th key={i} scope="row"><code>{cell}</code></th> : <td key={i} data-label={table.head[i]}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

/** Blog-detail sidebar layout, with the complete original policy copy. */
export function LegalPage({ title, lastUpdated, intro, sections }: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <>
      <PageHeader title={title} parents={[{ href: "/sitemap", label: "Legal" }]} />
      <section className="blog-details edu-legal">
        <div className="container">
          <div className="row edu-legal__row">
            <div className="col-xl-4 col-lg-4 edu-legal__aside">
              <nav className="sidebar__single sidebar__category edu-legal__toc" aria-label={`${title} contents`}>
                <div className="sidebar__title-box"><div className="sidebar__title-icon" aria-hidden="true"><span className="icon-tags" /></div><h2 className="sidebar__title">Contents</h2></div>
                <ol className="sidebar__category-list list-unstyled">
                  {sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}>{index + 1}. {section.title}<span className="fas fa-arrow-right" aria-hidden="true" /></a></li>)}
                </ol>
              </nav>
            </div>
            <div className="col-xl-8 col-lg-8">
              <div className="blog-details__left edu-legal__content">
                <p className="edu-legal__updated">Last updated: {lastUpdated}</p>
                <p className="edu-legal__intro">{intro}</p>
                {sections.map((section, index) => (
                  <section key={section.id} id={section.id} className="edu-legal__section">
                    <h2 className="blog-details__title-2">{index + 1}. {section.title}</h2>
                    <div className="edu-legal__body">{section.body.split(/\n\n+/).map(block)}</div>
                    {section.table && <PolicyTable table={section.table} />}
                  </section>
                ))}
                <div className="edu-legal__contact sidebar__single">
                  Questions? Reach us at <a href="mailto:legal@eduportal.example">legal@eduportal.example</a> or via the <a href="/contact">contact form</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
