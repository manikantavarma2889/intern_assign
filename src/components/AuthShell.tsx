import { ReactNode } from 'react';
import Logo from './Logo';

export default function AuthShell({
  title,
  subtitle,
  children,
  side,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_540px]">
      {/* Left brand column */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 border-r border-[color:var(--color-border)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #e8b05c 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full opacity-10 blur-3xl"
               style={{ background: 'radial-gradient(circle, #6dcfd1 0%, transparent 60%)' }} />
        </div>

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          {side ?? (
            <div className="space-y-8 max-w-md">
              <div className="font-display text-5xl xl:text-6xl leading-[1.05] text-[color:var(--color-text)]">
                Authentication<br />
                built the <span className="brass-text italic">right</span> way.
              </div>
              <p className="text-[color:var(--color-text-dim)] leading-relaxed">
                Email OTP verification, bcrypt password hashing, JWT sessions,
                rate-limited login attempts, and a proper forgot-password flow.
                Everything a real product needs — nothing more.
              </p>
              <ul className="grid grid-cols-2 gap-3 text-sm font-mono">
                {[
                  'bcrypt × 12 rounds',
                  'SHA-256 OTP hash',
                  'JWT HS256',
                  '5-min OTP TTL',
                  '60s resend cooldown',
                  '5 attempts / OTP',
                  '8 failed logins / 15m',
                  'Enumeration-safe',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[color:var(--color-muted)]">
                    <span className="w-1 h-1 rounded-full bg-[color:var(--color-brass)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative font-mono text-[11px] tracking-[0.2em] uppercase text-[color:var(--color-muted)]">
          v1.0 · production-grade
        </div>
      </div>

      {/* Right form column */}
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-[color:var(--color-border)]">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-4xl sm:text-5xl leading-tight text-[color:var(--color-text)]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-[color:var(--color-text-dim)]">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>

        <div className="p-6 text-center font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)] border-t border-[color:var(--color-border)]">
          © 2026 SecureAuth
        </div>
      </div>
    </div>
  );
}
