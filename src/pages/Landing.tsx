import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Timer, ShieldCheck, KeyRound, Database } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    { icon: Mail, title: 'Email OTP verification', text: '6-digit codes, hashed with SHA-256, 5-minute TTL, 5-attempt cap.' },
    { icon: Lock, title: 'bcrypt password hashing', text: '12 rounds by default. Passwords never leave the server in plaintext.' },
    { icon: KeyRound, title: 'JWT sessions', text: 'Signed HS256 tokens. Opt-in “remember me” switches session vs. persistent storage.' },
    { icon: Timer, title: 'Resend cooldown', text: '60-second wait between OTP resends. Sensible even under refresh spam.' },
    { icon: ShieldCheck, title: 'Enumeration-safe', text: 'Forgot-password never reveals whether an email is registered.' },
    { icon: Database, title: 'Real schema', text: 'Separate tables for users, OTP verifications and login attempts.' },
  ];

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]">
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg brass-gradient text-[#0a0f0d] px-4 py-2 text-sm font-medium"
              >
                Get started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-16 pb-24 relative">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-10 -left-24 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl"
                 style={{ background: 'radial-gradient(circle, #e8b05c 0%, transparent 60%)' }} />
            <div className="absolute -bottom-10 right-0 w-[420px] h-[420px] rounded-full opacity-10 blur-3xl"
                 style={{ background: 'radial-gradient(circle, #6dcfd1 0%, transparent 60%)' }} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[color:var(--color-border-strong)] font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-mint)]" />
            production-grade authentication
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-[92px] leading-[0.95] tracking-tight max-w-4xl">
            The auth flow<br />
            you keep <span className="brass-text italic">re-writing</span>,<br />
            done right.
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-[color:var(--color-text-dim)] leading-relaxed">
            <span className="font-mono text-[color:var(--color-brass)]">SecureAuth</span>{' '}
            is a full email + password authentication system with OTP verification,
            forgot-password recovery, JWT sessions and a proper backend schema. Built
            the way a senior engineer would ship it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 rounded-lg brass-gradient text-[#0a0f0d] px-6 py-3.5 font-medium shadow-[0_10px_30px_-10px_rgba(232,176,92,0.5)]"
            >
              {user ? 'Open dashboard' : 'Create an account'} <ArrowRight size={16} />
            </Link>
            <Link
              to={user ? '/profile' : '/login'}
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-strong)] px-6 py-3.5 text-sm text-[color:var(--color-text)] hover:border-[color:var(--color-brass)]/60"
            >
              {user ? 'Manage profile' : 'Sign in instead'}
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-[color:var(--color-border)]">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-4xl sm:text-5xl leading-tight">
              What you get<br />
              <span className="brass-text italic">out of the box.</span>
            </h2>
            <div className="hidden sm:block font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)]">
              /features
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 hover:border-[color:var(--color-brass)]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg border border-[color:var(--color-border-strong)] flex items-center justify-center mb-4 text-[color:var(--color-brass)]">
                  <f.icon size={18} />
                </div>
                <h3 className="font-display text-2xl mb-1.5">{f.title}</h3>
                <p className="text-sm text-[color:var(--color-text-dim)] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-16 border-t border-[color:var(--color-border)]">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
                Real REST<br />
                <span className="brass-text italic">endpoints.</span>
              </h2>
              <p className="text-[color:var(--color-text-dim)] max-w-md leading-relaxed">
                Every screen is backed by a proper serverless endpoint — no mock data,
                no local-only tricks. This is a real backend with a real Postgres schema.
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] p-6 font-mono text-[13px] leading-relaxed">
              {[
                ['POST', '/api/register'],
                ['POST', '/api/verify-email'],
                ['POST', '/api/resend-otp'],
                ['POST', '/api/login'],
                ['POST', '/api/logout'],
                ['GET ', '/api/me'],
                ['POST', '/api/forgot-password'],
                ['POST', '/api/reset-password'],
                ['PUT ', '/api/change-password'],
                ['GET ', '/api/login-history'],
              ].map(([method, path]) => (
                <div key={path} className="flex gap-4 py-1 border-b border-dashed border-[color:var(--color-border)] last:border-0">
                  <span className="text-[color:var(--color-brass)] w-14 shrink-0">{method}</span>
                  <span className="text-[color:var(--color-text)]">{path}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-[color:var(--color-border)] mt-16 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)]">
        <div>© 2026 SecureAuth</div>
        <div>built with react · typescript · postgres</div>
      </footer>
    </div>
  );
}
