import { FormEvent, useState } from 'react';
import { Save, Lock, User as UserIcon } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import Field from '../components/Field';
import Button from '../components/Button';
import Alert from '../components/Alert';
import PasswordStrength, { evaluatePassword } from '../components/PasswordStrength';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setNameMsg(null);
    if (name.trim().length < 2) return setNameMsg({ kind: 'error', text: 'Name must be at least 2 characters' });
    setSavingName(true);
    try {
      await api('/api/update-profile', { method: 'PUT', body: JSON.stringify({ name }) });
      await refresh();
      setNameMsg({ kind: 'success', text: 'Profile updated' });
    } catch (err) {
      setNameMsg({ kind: 'error', text: (err as ApiError).error || 'Update failed' });
    } finally {
      setSavingName(false);
    }
  };

  const changePw = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!current) return setPwMsg({ kind: 'error', text: 'Enter your current password' });
    const { score } = evaluatePassword(pw);
    if (score < 4) return setPwMsg({ kind: 'error', text: 'Choose a stronger new password' });
    if (pw !== confirm) return setPwMsg({ kind: 'error', text: "Passwords don't match" });
    setSavingPw(true);
    try {
      await api('/api/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: current, newPassword: pw, confirmPassword: confirm }),
      });
      setPwMsg({ kind: 'success', text: 'Password updated' });
      setCurrent(''); setPw(''); setConfirm('');
    } catch (err) {
      setPwMsg({ kind: 'error', text: (err as ApiError).error || 'Could not update password' });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-[color:var(--color-muted)] mb-2">
            account settings
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-none">
            Your <span className="brass-text italic">profile</span>.
          </h1>
        </div>

        <div className="space-y-8">
          {/* Profile info */}
          <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 sm:p-8">
            <h2 className="font-display text-3xl mb-1">Profile information</h2>
            <p className="text-sm text-[color:var(--color-text-dim)] mb-6">
              Update how you're identified across SecureAuth.
            </p>

            <form onSubmit={saveName} className="space-y-5">
              {nameMsg && <Alert variant={nameMsg.kind}>{nameMsg.text}</Alert>}
              <Field
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon size={16} />}
              />
              <Field
                label="Email"
                value={user?.email || ''}
                disabled
                hint="Email is your primary identifier and can't be changed here."
              />
              <div className="flex justify-end">
                <Button type="submit" loading={savingName}>
                  <Save size={16} /> Save changes
                </Button>
              </div>
            </form>
          </section>

          {/* Change password */}
          <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/50 p-6 sm:p-8">
            <h2 className="font-display text-3xl mb-1">Change password</h2>
            <p className="text-sm text-[color:var(--color-text-dim)] mb-6">
              You'll stay signed in on this device.
            </p>

            <form onSubmit={changePw} className="space-y-5">
              {pwMsg && <Alert variant={pwMsg.kind}>{pwMsg.text}</Alert>}
              <Field
                label="Current password"
                toggleReveal
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete="current-password"
              />
              <div className="space-y-2">
                <Field
                  label="New password"
                  toggleReveal
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  icon={<Lock size={16} />}
                  autoComplete="new-password"
                />
                <PasswordStrength value={pw} />
              </div>
              <Field
                label="Confirm new password"
                toggleReveal
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                icon={<Lock size={16} />}
                error={confirm && confirm !== pw ? "Passwords don't match" : null}
                autoComplete="new-password"
              />
              <div className="flex justify-end">
                <Button type="submit" loading={savingPw}>
                  <Lock size={16} /> Update password
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
