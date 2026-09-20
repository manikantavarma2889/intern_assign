import supabase from './db-client.js';
import { cors, hashPassword, passwordIssues } from './_helpers/auth.js';
import { hashOtp } from './_helpers/otp.js';

const MAX_ATTEMPTS = 5;

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, otp, newPassword, confirmPassword } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    const issues = passwordIssues(newPassword);
    if (issues.length) return res.status(400).json({ error: `Password requirements not met: ${issues.join(', ')}` });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

    const { data: rec } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('purpose', 'password_reset')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rec) return res.status(400).json({ error: 'No pending reset. Please request a new code.' });
    if (new Date(rec.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This code has expired. Please request a new one.' });
    }
    if (rec.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    if (hashOtp(cleanOtp) !== rec.otp_hash) {
      const attempts = rec.attempts + 1;
      await supabase.from('otp_verifications').update({ attempts }).eq('id', rec.id);
      const left = Math.max(0, MAX_ATTEMPTS - attempts);
      return res.status(400).json({ error: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` : 'Too many attempts. Please request a new code.' });
    }

    const password_hash = await hashPassword(newPassword);
    await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    await supabase.from('otp_verifications').update({ verified: true }).eq('id', rec.id);

    return res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ error: 'Reset failed. Please try again.' });
  }
}
