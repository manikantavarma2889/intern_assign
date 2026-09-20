import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MailCheck, RotateCw } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../contexts/AuthContext';

function maskEmail(e: string) {
  if (!e || !e.includes('@')) return e;
  const [local, domain] = e.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const visible = Math.min(2, Math.max(1, Math.floor(local.length / 4)));
  return `${local.slice(0, visible)}${'*'.repeat(Math.max(3, local.length - visible))}@${domain}`;
}

export default function VerifyEmail() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { email?: string } };
  const { applySession } = useAuth();

  const email = loc.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!email) nav('/register', { replace: true });
  }, [email, nav]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setOtpStatus('idle');
    try {
      const res = await api<{ token: string; user: User }>('/api/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp: code }),
        auth: false,
      });
      setOtpStatus('success');
      // Let the green success ring finish tracing before we navigate away
      setTimeout(() => {
        applySession(res.token, res.user, false);
        nav('/dashboard', { replace: true });
      }, 650);
    } catch (err) {
      setOtpStatus('error');
      setError((err as ApiError).error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [email, applySession, nav]);

  const resend = async () => {
    setResending(true);
    setError(null);
    try {
      await api<{ message: string }>('/api/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'email_verify' }),
        auth: false,
      });
      setCooldown(60);
      setOtp('');
    } catch (err) {
      const e = err as ApiError;
      if (e.extra?.cooldown) setCooldown(e.extra.cooldown);
      setError(e.error || 'Could not resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell title="Check your inbox." subtitle={<>We sent a 6-digit code to <span className="text-[color:var(--color-text)] font-mono">{maskEmail(email)}</span></>}>
      <form
        onSubmit={(e) => { e.preventDefault(); if (otp.length === 6) submit(otp); }}
        className="space-y-6"
      >
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-[color:var(--color-muted)] mb-3">
            Verification code
          </div>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (otpStatus !== 'idle') setOtpStatus('idle');
              if (error) setError(null);
            }}
            onComplete={submit}
            status={otpStatus}
            size="lg"
            autoFocus
            disabled={loading || otpStatus === 'success'}
            className="w-full justify-center"
          />
          <div className="mt-3 text-xs font-mono text-[color:var(--color-muted)]">
            Code expires in 5 minutes.
          </div>
        </div>

        <Button type="submit" loading={loading} disabled={otp.length !== 6} className="w-full">
          <MailCheck size={16} /> Verify email
        </Button>

        <div className="text-center text-sm text-[color:var(--color-text-dim)]">
          Didn't receive the code?{' '}
          {cooldown > 0 ? (
            <span className="font-mono text-[color:var(--color-muted)]">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="inline-flex items-center gap-1 text-[color:var(--color-brass)] hover:underline disabled:opacity-50"
            >
              <RotateCw size={13} className={resending ? 'animate-spin' : ''} /> Resend code
            </button>
          )}
        </div>

        <div className="text-center text-xs text-[color:var(--color-muted)]">
          Wrong email?{' '}
          <Link to="/register" className="text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)] underline underline-offset-2">
            Start over
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
