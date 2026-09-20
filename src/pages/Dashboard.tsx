import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Clock, KeyRound, Fingerprint, Mail, ChevronRight, MonitorSmartphone } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

type Attempt = {
  id: number;
  ip_address: string;
  user_agent: string;
  success: boolean;
  created_at: string;
};

function maskEmail(e?: string) {
  if (!e || !e.includes('@')) return e || '';
  const [local, domain] = e.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const visible = Math.min(2, Math.max(1, Math.floor(local.length / 4)));
  return `${local.slice(0, visible)}${'*'.repeat(Math.max(3, local.length - visible))}@${domain}`;
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function shortUa(ua: string) {
  if (!ua) return 'Unknown';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS · Safari';
  if (/Android/i.test(ua)) return 'Android';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua)) return 'Safari';
  return ua.slice(0, 32);
}

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [history, setHistory] = useState<Attempt[] | null>(null);

  useEffect(() => {
    refresh();
    api<{ history: Attempt[] }>('/api/login-history')
      .then((r) => setHistory(r.history))
      .catch(() => setHistory([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const successCount = history?.filter((h) => h.success).length ?? 0;
  const failCount = history?.filter((h) => !h.success).length ?? 0;
  const lastSuccess = history?.find((h) => h.success);

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-[color:var(--color-muted)] mb-2">
              welcome back
            </div>
            <h1 className="font-display text-5xl sm:text-6xl leading-none">
              Hello, <span className="brass-text italic">{user?.name?.split(' ')[0] || 'there'}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[color:var(--color-mint)]/30 bg-[color:var(--color-mint)]/[0.06] text-sm text-[color:var(--color-mint)]">
            <CheckCircle2 size={14} /> Account fully verified
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Email verification"
            value="Verified"
            tone="mint"
            icon={<ShieldCheck size={16} />}
            sub={`since ${formatDate(user?.updated_at || user?.created_at)}`}
          />
          <StatCard
            label="Successful sign-ins"
            value={history === null ? '—' : String(successCount)}
            tone="brass"
            icon={<Fingerprint size={16} />}
            sub={lastSuccess ? `last ${relTime(lastSuccess.created_at)}` : 'no history yet'}
          />
          <StatCard
            label="Failed attempts (30d)"
            value={history === null ? '—' : String(failCount)}
            tone={failCount > 0 ? 'coral' : 'muted'}
            icon={<Clock size={16} />}
            sub={failCount > 0 ? 'monitored & rate-limited' : 'all clear'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left — account details */}
          <section className="lg:col-span-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl">Account</h2>
              <span className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)]">
                /account
              </span>
            </div>

            <dl className="divide-y divide-[color:var(--color-border)]">
              <Row label="Full name" value={user?.name || '—'} />
              <Row label="Email" value={maskEmail(user?.email)} mono />
              <Row
                label="Email verification"
                value={
                  <span className="inline-flex items-center gap-1.5 text-[color:var(--color-mint)]">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                }
              />
              <Row label="Password" value={<span className="font-mono tracking-[0.4em]">••••••••••</span>} />
              <Row label="Member since" value={formatDate(user?.created_at)} mono />
              <Row label="Last updated" value={formatDate(user?.updated_at)} mono />
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-strong)] px-4 py-2.5 text-sm text-[color:var(--color-text)] hover:border-[color:var(--color-brass)]/60">
                <KeyRound size={14} /> Change password
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border-strong)] px-4 py-2.5 text-sm text-[color:var(--color-text)] hover:border-[color:var(--color-brass)]/60">
                Update profile <ChevronRight size={14} />
              </Link>
            </div>
          </section>

          {/* Right — security summary */}
          <aside className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl">Security</h2>
              <ShieldCheck size={18} className="text-[color:var(--color-brass)]" />
            </div>
            <ul className="space-y-4">
              {[
                { label: 'Password hashing', detail: 'bcrypt, 12 rounds' },
                { label: 'OTP hashing', detail: 'SHA-256 + pepper' },
                { label: 'OTP TTL', detail: '5 minutes' },
                { label: 'Session', detail: 'JWT (HS256)' },
                { label: 'Login rate-limit', detail: '8 failures / 15 min' },
              ].map((s) => (
                <li key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--color-text-dim)]">{s.label}</span>
                  <span className="font-mono text-[color:var(--color-text)]">{s.detail}</span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Full-width login history */}
          <section className="lg:col-span-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl">Login history</h2>
              <span className="font-mono text-[11px] tracking-widest uppercase text-[color:var(--color-muted)]">
                latest 25
              </span>
            </div>

            {history === null ? (
              <div className="py-16 flex items-center justify-center text-sm text-[color:var(--color-muted)]">
                Loading history…
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Mail size={22} className="text-[color:var(--color-muted)] mb-2" />
                <div className="text-sm text-[color:var(--color-text-dim)]">No login attempts yet.</div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 sm:-mx-8">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                      <th className="px-6 sm:px-8 py-2">Status</th>
                      <th className="px-4 py-2">When</th>
                      <th className="px-4 py-2">Device</th>
                      <th className="px-4 py-2">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-border)]">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="px-6 sm:px-8 py-3">
                          {h.success ? (
                            <span className="inline-flex items-center gap-1.5 text-[color:var(--color-mint)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-mint)]" /> Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[color:var(--color-coral)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-coral)]" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-text-dim)]">
                          <div>{formatDate(h.created_at)}</div>
                          <div className="text-[11px] font-mono text-[color:var(--color-muted)]">{relTime(h.created_at)}</div>
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-text-dim)]">
                          <span className="inline-flex items-center gap-2">
                            <MonitorSmartphone size={13} className="text-[color:var(--color-muted)]" />
                            {shortUa(h.user_agent)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[color:var(--color-text-dim)]">{h.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label, value, sub, icon, tone,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  tone: 'brass' | 'mint' | 'coral' | 'muted';
}) {
  const color =
    tone === 'mint' ? 'var(--color-mint)' :
    tone === 'coral' ? 'var(--color-coral)' :
    tone === 'brass' ? 'var(--color-brass)' :
    'var(--color-text-dim)';
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-muted)]">{label}</div>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="font-display text-4xl leading-none" style={{ color }}>{value}</div>
      {sub && <div className="mt-2 text-xs text-[color:var(--color-muted)] font-mono">{sub}</div>}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="text-sm text-[color:var(--color-text-dim)]">{label}</div>
      <div className={`text-sm text-[color:var(--color-text)] ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
