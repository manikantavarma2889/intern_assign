import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email');
    setLoading(true);
    try {
      await api<{ message: string }>('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        auth: false,
      });
      nav('/reset-password', { state: { email } });
    } catch (err) {
      setError((err as ApiError).error || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password."
      subtitle="We'll email a 6-digit code so you can set a new one."
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}
        <Alert variant="info">
          For security, we don't reveal whether an email is registered. You'll be
          taken to the next step either way.
        </Alert>

        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          autoComplete="email"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Send reset code <ArrowRight size={16} />
        </Button>

        <div className="text-center text-sm text-[color:var(--color-text-dim)]">
          Remembered it?{' '}
          <Link to="/login" className="text-[color:var(--color-brass)] hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
