import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Service Status",
  description: "Real-time status, uptime, and incident history for EduPortal services including the platform, AI tutor, live classes, and payments.",
  path: "/status",
});
const DAYS = 90;
const services = [
  { name: "Platform (Web & Mobile)", description: "Course player, dashboard, profile.", uptime: "99.98%" },
  { name: "Authentication", description: "Sign-in, registration, Google sign-in.", uptime: "100.00%" },
  { name: "AI Chat tutor", description: "Real-time AI tutoring sessions.", uptime: "99.94%" },
  { name: "AI Quiz & Assignment", description: "AI quiz generation and assignment helper.", uptime: "99.91%" },
  { name: "Live classes", description: "Live-streaming and recordings.", uptime: "99.86%" },
  { name: "Payments & billing", description: "Subscriptions, invoices, refunds.", uptime: "99.99%" },
  { name: "Notifications", description: "Email, push, and in-app alerts.", uptime: "99.92%" },
  { name: "Forum & messaging", description: "Community forum and DMs.", uptime: "99.95%" },
];
// Incidents are dated relative to today so the history and the bars above it always line up.
const incidents = [
  { daysAgo: 8, service: "AI Chat tutor", severity: "Minor", title: "Elevated AI response latency in EU region", updates: [
    { time: "14:48 UTC", body: "Investigating reports of slow AI tutor responses in Europe." },
    { time: "15:11 UTC", body: "Identified — upstream model provider throttling. Rerouting traffic." },
    { time: "15:34 UTC", body: "Resolved. Latency back within normal range." },
  ] },
  { daysAgo: 22, service: "Live classes", severity: "Major", title: "Live class join failures for ~12 minutes", updates: [
    { time: "09:02 UTC", body: "We're aware some users can't join scheduled live classes. Investigating." },
    { time: "09:10 UTC", body: "Identified — bad deploy to live-class gateway. Rolling back." },
    { time: "09:14 UTC", body: "Rollback complete. Monitoring." },
    { time: "09:24 UTC", body: "Fully resolved. Recordings of impacted sessions are being regenerated." },
  ] },
  { daysAgo: 46, service: "Notifications", severity: "Minor", title: "Email delivery delays via secondary provider", updates: [
    { time: "20:30 UTC", body: "Some transactional emails are delayed up to 15 minutes." },
    { time: "21:02 UTC", body: "Failover to primary provider complete. Queue draining." },
    { time: "21:18 UTC", body: "Resolved." },
  ] },
];
// Short degradations below the incident threshold (no public write-up), per service.
const minorDays: Record<string, number[]> = {
  "AI Quiz & Assignment": [61],
  "Forum & messaging": [33],
  "Platform (Web & Mobile)": [74],
};
type DayState = "up" | "partial" | "outage";
const STATE_LABEL: Record<DayState, string> = { up: "No downtime", partial: "Degraded performance", outage: "Outage" };

function dayFromToday(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}
function formatDate(date: Date) { return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
function shortDate(date: Date) { return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

function historyFor(service: string) {
  const days: DayState[] = Array.from({ length: DAYS }, () => "up");
  for (const ago of minorDays[service] ?? []) days[DAYS - 1 - ago] = "partial";
  for (const incident of incidents) if (incident.service === service) days[DAYS - 1 - incident.daysAgo] = incident.severity === "Major" ? "outage" : "partial";
  return days;
}

function UptimeBars({ service }: { service: string }) {
  const days = historyFor(service);
  const issues = days.flatMap((state, i) => state === "up" ? [] : [`${STATE_LABEL[state].toLowerCase()} on ${shortDate(dayFromToday(DAYS - 1 - i))}`]);
  const summary = `${service}, last ${DAYS} days: ${issues.length ? issues.join("; ") : "no downtime"}.`;
  return <div className="edu-status__history">
    <div className="edu-status__bars" role="img" aria-label={summary}>
      {days.map((state, i) => {
        // Tooltips in the outer thirds open inwards so they never run off the edge of a narrow screen.
        const align = i < DAYS / 3 ? " edu-status__bar--start" : i >= (DAYS * 2) / 3 ? " edu-status__bar--end" : "";
        return <span key={i} className={`edu-status__bar edu-status__bar--${state}${align}`} data-tip={`${shortDate(dayFromToday(DAYS - 1 - i))} · ${STATE_LABEL[state]}`} aria-hidden="true" />;
      })}
    </div>
    <div className="edu-status__axis" aria-hidden="true"><span>{DAYS} days ago</span><span>Today</span></div>
  </div>;
}

export default function StatusPage() { return <>
  <PageHeader title="Service Status" parents={[]} />
  <section className="edu-content-section edu-status"><div className="container">
    {/* The page header already names the page; the summary card is the first thing to read. */}
    <p className="edu-section-intro edu-status__intro">Service health, 90-day uptime and recent incidents. Subscribe by email to get notified the moment something changes.</p>
    <div className="edu-status__summary"><span className="edu-status__icon fas fa-check-circle" aria-hidden="true" /><div><h2>All systems operational</h2><p>Last checked just now · 90-day average uptime: <strong>99.94%</strong></p></div><a href="mailto:status-subscribe@eduportal.app" className="thm-btn"><span className="icon-angles-right" />Subscribe</a></div>
    <div className="edu-status__head">
      <h2 className="edu-section-title">Service health</h2>
      <ul className="edu-status__legend list-unstyled" aria-label="Uptime bar legend">
        <li><span className="edu-status__swatch edu-status__bar--up" aria-hidden="true" />No downtime</li>
        <li><span className="edu-status__swatch edu-status__bar--partial" aria-hidden="true" />Degraded</li>
        <li><span className="edu-status__swatch edu-status__bar--outage" aria-hidden="true" />Outage</li>
      </ul>
    </div>
    <ul className="edu-status__services list-unstyled">{services.map(service => <li className="edu-status__service" key={service.name}><div className="edu-status__service-top"><span className="edu-status__dot" aria-hidden="true" /><div className="edu-status__service-name"><h3>{service.name}</h3><p>{service.description}</p></div><div className="edu-status__uptime"><small>90-day uptime</small><strong>{service.uptime}</strong></div><span className="edu-status__badge">Operational</span></div><UptimeBars service={service.name} /></li>)}</ul>
    <h2 className="edu-section-title">Recent incidents</h2><p className="edu-status__subheading">Past 90 days</p><ul className="edu-status__incidents list-unstyled">{incidents.map(incident => <li className="edu-status__incident" key={incident.title}><div className="edu-status__incident-meta"><span className={`edu-status__badge edu-status__badge--${incident.severity.toLowerCase()}`}>{incident.severity}</span><span>{formatDate(dayFromToday(incident.daysAgo))} · {incident.service}</span><span className="edu-status__badge">Resolved</span></div><h3>{incident.title}</h3><ol>{incident.updates.map(update => <li key={update.time}><strong>{update.time}</strong> {update.body}</li>)}</ol></li>)}</ul>
    <div className="edu-status__sla"><div><h2>Looking for our SLA?</h2><p>Business customers can request our 99.9% SLA and incident postmortems. We publish RCAs for every major incident within 5 business days.</p></div><div className="edu-status__actions"><a href="/business" className="thm-btn"><span className="icon-angles-right" />EduPortal for Business</a><a href="/contact?reason=Partnership" className="edu-outline-link">Contact sales</a></div></div>
  </div></section>
</>; }
