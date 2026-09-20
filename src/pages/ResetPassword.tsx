import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import PasswordStrength, { evaluatePassword } from '../components/PasswordStrength';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';

export default function ResetPassword() {
  const loc = useLocation() as { state?: { email?: string } };
  const nav = useNavigate();

  const email = loc.state?.email || '';
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) nav('/forgot-password', { replace: true });
  }, [email, nav]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    const { score } = evaluatePassword(pw);
    if (score < 4) return setError('Please choose a stronger password');
    if (pw !== confirm) return setError('Passwords do not match');

    setLoading(true);
    setOtpStatus('idle');
    try {
      await api<{ message: string }>('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword: pw, confirmPassword: confirm }),
        auth: false,
      });
      setOtpStatus('success');
      setSuccess('Password updated. Redirecting to sign in…');
      setTimeout(() => nav('/login', { replace: true }), 1400);
    } catch (err) {
      setOtpStatus('error');
      setError((err as ApiError).error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true); setError(null);
    try {
      await api<{ message: string }>('/api/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: 'password_reset' }),
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
    <AuthShell title="Set a new password." subtitle={`Enter the code we sent to ${email}.`}>
      <form onSubmit={submit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div>
          <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-[color:var(--color-muted)] mb-3">
            Reset code
          </div>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (otpStatus !== 'idle') setOtpStatus('idle');
              if (error) setError(null);
            }}
            status={otpStatus}
            size="lg"
            autoFocus
            disabled={loading || otpStatus === 'success'}
            className="w-full justify-center"
          />
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-[color:var(--color-muted)]">
            <span>Expires in 5 min</span>
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button type="button" onClick={resend} disabled={resending} className="text-[color:var(--color-brass)] hover:underline">
                Resend code
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Field
            label="New password"
            toggleReveal
            placeholder="Choose a strong new password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            icon={<Lock size={16} />}
            autoComplete="new-password"
            required
          />
          <PasswordStrength value={pw} />
        </div>

        <Field
          label="Confirm new password"
          toggleReveal
          placeholder="Repeat the new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<Lock size={16} />}
          error={confirm && confirm !== pw ? "Passwords don't match" : null}
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          <KeyRound size={16} /> Update password
        </Button>

        <div className="text-center text-sm text-[color:var(--color-text-dim)]">
          <Link to="/login" className="text-[color:var(--color-brass)] hover:underline">Back to sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}
