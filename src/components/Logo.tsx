import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 group">
      <svg width="26" height="26" viewBox="0 0 64 64" className="transition-transform group-hover:rotate-[8deg]">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0c377" />
            <stop offset="1" stopColor="#b6803a" />
          </linearGradient>
        </defs>
        <path d="M32 6 L54 15 V32 C54 45 44 54 32 58 C20 54 10 45 10 32 V15 Z"
          fill="none" stroke="url(#logo-g)" strokeWidth="3" strokeLinejoin="round"/>
        <rect x="23" y="27" width="18" height="16" rx="2.5" fill="url(#logo-g)"/>
        <path d="M26 27 V22 a6 6 0 0 1 12 0 V27" fill="none" stroke="url(#logo-g)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <span className="font-display text-[22px] leading-none text-[color:var(--color-text)]">
        Secure<span className="brass-text italic">Auth</span>
      </span>
    </Link>
  );
}
