import type { ReactNode } from "react";
import Icon from "@/components/icons";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10 justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/xtroedge-x.svg" alt="XtroEdge" width={36} height={36} className="rounded-xl shrink-0" />
          <span className="text-lg font-semibold gradient-text">EduPortal</span>
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-lg">{children}</div>
        </div>
        <p className="text-xs text-[var(--muted)] text-center">
          © {new Date().getFullYear()} EduPortal — built for curious minds.
        </p>
      </div>
      <div className="hidden lg:flex relative overflow-hidden m-6 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
        <AuthArtworkBackground />
        <div className="relative p-10 flex flex-col justify-between w-full">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
              <Icon.Sparkles size={12} /> Powered by Claude AI
            </span>
            <h1 className="text-4xl font-bold leading-tight mt-4">
              Learn smarter,<br /> finish faster.
            </h1>
            <p className="text-white/85 max-w-sm">
              Personalized study plans, AI tutoring, quiz generation, and assignment help —
              all in one beautiful learning hub.
            </p>
          </div>

          {/* Hero illustration */}
          <div className="relative flex-1 flex items-center justify-center my-6">
            <AuthHeroSVG />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Active learners" value="12k+" />
            <Stat label="Courses" value="120+" />
            <Stat label="Avg. rating" value="4.8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

/** Subtle dot grid + soft glow blobs behind the artwork. */
function AuthArtworkBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            <pattern id="auth-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dots)" />
        </svg>
      </div>
      <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-green-300/30 blur-3xl" />
    </div>
  );
}

/** Central hero illustration — an app window mid-AI-lesson with floating accents. */
function AuthHeroSVG() {
  return (
    <svg
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md drop-shadow-[0_25px_45px_rgba(8,15,40,0.35)]"
      role="img"
      aria-label="Illustration of AI-assisted learning"
    >
      <defs>
        <linearGradient id="auth-window" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f6ff" />
        </linearGradient>
        <linearGradient id="auth-pill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="auth-bar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="auth-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="auth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Background blobs */}
      <circle cx="60" cy="60" r="50" fill="#ffffff" opacity="0.1" />
      <circle cx="430" cy="320" r="70" fill="#ffffff" opacity="0.08" />

      {/* App window shadow */}
      <rect x="58" y="62" width="370" height="232" rx="18" fill="#000000" opacity="0.18" filter="url(#auth-shadow)" />

      {/* App window */}
      <g transform="translate(50 54)">
        <rect x="0" y="0" width="370" height="232" rx="18" fill="url(#auth-window)" />
        {/* Header bar */}
        <rect x="0" y="0" width="370" height="36" rx="18" fill="#f0fdf4" />
        <rect x="0" y="18" width="370" height="18" fill="#f0fdf4" />
        <circle cx="20" cy="18" r="5" fill="#fca5a5" />
        <circle cx="38" cy="18" r="5" fill="#fcd34d" />
        <circle cx="56" cy="18" r="5" fill="#86efac" />
        <rect x="110" y="10" width="170" height="16" rx="8" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
        <circle cx="122" cy="18" r="3" fill="#94a3b8" />

        {/* Sidebar */}
        <rect x="0" y="36" width="84" height="196" fill="#f0fdf4" />
        <rect x="0" y="36" width="3" height="196" fill="url(#auth-pill)" />
        <rect x="14" y="52" width="56" height="10" rx="5" fill="url(#auth-pill)" />
        <rect x="14" y="74" width="42" height="6" rx="3" fill="#cbd5e1" />
        <rect x="14" y="88" width="52" height="6" rx="3" fill="#cbd5e1" />
        <rect x="14" y="102" width="38" height="6" rx="3" fill="#cbd5e1" />
        <rect x="10" y="118" width="64" height="22" rx="8" fill="#dcfce7" />
        <circle cx="20" cy="129" r="3" fill="#16a34a" />
        <rect x="28" y="126" width="38" height="6" rx="3" fill="#16a34a" />

        {/* Main content */}
        <g transform="translate(100 52)">
          <rect x="0" y="0" width="140" height="12" rx="6" fill="#0f172a" />
          <rect x="0" y="20" width="200" height="6" rx="3" fill="#cbd5e1" />

          {/* AI bubble */}
          <g transform="translate(0 40)">
            <circle cx="12" cy="12" r="12" fill="url(#auth-pill)" />
            <path d="M12 6 l1.5 4 L18 12 l-4.5 2 L12 18 l-1.5 -4 L6 12 l4.5 -2 z" fill="#ffffff" />
            <rect x="32" y="2" width="220" height="22" rx="11" fill="#f0fdf4" />
            <rect x="42" y="9" width="160" height="4" rx="2" fill="#94a3b8" />
            <rect x="42" y="16" width="100" height="4" rx="2" fill="#bbf7d0" />
          </g>

          {/* User bubble */}
          <g transform="translate(0 76)">
            <rect x="60" y="0" width="192" height="22" rx="11" fill="url(#auth-pill)" />
            <rect x="72" y="7" width="140" height="4" rx="2" fill="#ffffff" opacity="0.9" />
            <rect x="72" y="14" width="90" height="4" rx="2" fill="#ffffff" opacity="0.7" />
          </g>

          {/* Progress card */}
          <g transform="translate(0 112)">
            <rect x="0" y="0" width="252" height="56" rx="12" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="12" y="12" width="80" height="8" rx="4" fill="#0f172a" />
            <rect x="12" y="26" width="120" height="5" rx="2.5" fill="#cbd5e1" />
            <rect x="12" y="40" width="228" height="6" rx="3" fill="#dcfce7" />
            <rect x="12" y="40" width="160" height="6" rx="3" fill="url(#auth-bar)" />
            <rect x="206" y="10" width="36" height="14" rx="7" fill="#dcfce7" />
            <text x="213" y="21" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#16a34a">
              70%
            </text>
          </g>
        </g>
      </g>

      {/* Floating: sparkle orb */}
      <g transform="translate(440 70)" style={{ animation: "float-slow 5.5s ease-in-out infinite 0.2s" }}>
        <circle cx="0" cy="0" r="26" fill="#ffffff" />
        <circle cx="0" cy="0" r="26" fill="url(#auth-pill)" opacity="0.12" />
        <path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="url(#auth-pill)" />
      </g>

      {/* Floating: notification chip */}
      <g transform="translate(360 280)" style={{ animation: "float-slow 6s ease-in-out infinite 0.6s" }}>
        <rect x="0" y="0" width="110" height="36" rx="14" fill="#ffffff" />
        <circle cx="18" cy="18" r="10" fill="#dcfce7" />
        <path d="M18 13 v6 M14 18 h8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        <rect x="34" y="10" width="60" height="6" rx="3" fill="#0f172a" />
        <rect x="34" y="22" width="40" height="4" rx="2" fill="#bbf7d0" />
        <circle cx="98" cy="9" r="5" fill="#ef4444" />
      </g>

      {/* Floating: book (bottom-left) */}
      <g transform="translate(10 230)" style={{ animation: "float-slow 5s ease-in-out infinite 0.4s" }}>
        <rect x="0" y="0" width="76" height="54" rx="8" fill="#ffffff" />
        <rect x="0" y="0" width="5" height="54" rx="2.5" fill="url(#auth-pill)" />
        <rect x="14" y="12" width="48" height="6" rx="3" fill="#0f172a" />
        <rect x="14" y="24" width="52" height="4" rx="2" fill="#cbd5e1" />
        <rect x="14" y="34" width="38" height="4" rx="2" fill="#cbd5e1" />
      </g>

      {/* Tiny floating accents */}
      <g style={{ animation: "float-slow 7s ease-in-out infinite" }}>
        <circle cx="240" cy="30" r="5" fill="#fbbf24" />
      </g>
      <g style={{ animation: "float-slow 8s ease-in-out infinite 1s" }}>
        <rect x="36" y="20" width="12" height="12" rx="3" fill="url(#auth-orange)" transform="rotate(-12 42 26)" />
      </g>
    </svg>
  );
}
