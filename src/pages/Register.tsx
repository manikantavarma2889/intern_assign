import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import Button from '../components/Button';
import Alert from '../components/Alert';
import PasswordStrength, { evaluatePassword } from '../components/PasswordStrength';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your name');
    if (!email.includes('@')) return setError('Please enter a valid email');
    const { score } = evaluatePassword(password);
    if (score < 4) return setError('Please choose a stronger password');
    if (password !== confirm) return setError('Passwords do not match');
    if (!terms) return setError('You must accept the terms to continue');

    setLoading(true);
    try {
      const res = await api<{ email: string }>('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword: confirm }),
        auth: false,
      });
      nav('/verify-email', { state: { email: res.email } });
    } catch (err) {
      setError((err as ApiError).error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account." subtitle="Takes under a minute. Email verification comes next.">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <Field
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={16} />}
          required
        />

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

        <div className="space-y-2">
          <Field
            label="Password"
            toggleReveal
            autoComplete="new-password"
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />
          <PasswordStrength value={password} />
        </div>

        <Field
          label="Confirm password"
          toggleReveal
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<Lock size={16} />}
          error={confirm && confirm !== password ? "Passwords don't match" : null}
          required
        />

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <span className={`relative mt-0.5 w-5 h-5 rounded border transition-colors ${
            terms
              ? 'bg-[color:var(--color-brass)] border-[color:var(--color-brass)]'
              : 'border-[color:var(--color-border-strong)]'
          }`}>
            {terms && (
              <svg viewBox="0 0 20 20" className="absolute inset-0 w-full h-full text-[#0a0f0d]" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 10l3.5 3.5L15 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <input type="checkbox" className="sr-only" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          </span>
          <span className="text-sm text-[color:var(--color-text-dim)] leading-relaxed">
            I agree to the SecureAuth Terms of Service and Privacy Policy.
          </span>
        </label>

        <Button type="submit" loading={loading} className="w-full">
          Create account <ArrowRight size={16} />
        </Button>

        <div className="text-center text-sm text-[color:var(--color-text-dim)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[color:var(--color-brass)] hover:underline">Sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}
