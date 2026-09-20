import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/api';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state: { from?: string } };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Enter your email and password'); return; }
    setLoading(true);
    try {
      await login(email, password, remember);
      nav(loc.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 403 && e.extra?.needsVerification) {
        nav('/verify-email', { state: { email: e.extra.email } });
        return;
      }
      setError(e.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back." subtitle="Sign in to your SecureAuth account.">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
        />

        <Field
          label="Password"
          toggleReveal
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          hint={
            <Link to="/forgot-password" className="text-[color:var(--color-brass)] hover:underline">
              Forgot?
            </Link>
          }
          required
        />

        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <span className={`relative w-9 h-5 rounded-full transition-colors ${
            remember ? 'bg-[color:var(--color-brass)]' : 'bg-[color:var(--color-border-strong)]'
          }`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[color:var(--color-bg)] transition-transform ${
              remember ? 'translate-x-4' : ''
            }`} />
            <input type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          </span>
          <span className="text-sm text-[color:var(--color-text-dim)] group-hover:text-[color:var(--color-text)]">
            Remember me on this device
          </span>
        </label>

        <Button type="submit" loading={loading} className="w-full">
          Sign in <ArrowRight size={16} />
        </Button>

        <div className="text-center text-sm text-[color:var(--color-text-dim)]">
          New here?{' '}
          <Link to="/register" className="text-[color:var(--color-brass)] hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
