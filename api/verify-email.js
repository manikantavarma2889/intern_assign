import supabase from './db-client.js';
import { cors, signAccessToken } from './_helpers/auth.js';
import { hashOtp } from './_helpers/otp.js';

const MAX_ATTEMPTS = 5;

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, otp } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Enter the 6-digit code sent to your email' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

    if (user.email_verified) {
      return res.status(400).json({ error: 'This email is already verified. Please sign in.' });
    }

    const { data: rec } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('purpose', 'email_verify')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rec) return res.status(400).json({ error: 'No pending verification. Please request a new code.' });

    if (new Date(rec.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This code has expired. Please request a new one.' });
    }

    if (rec.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    const incoming_hash = hashOtp(cleanOtp);
    if (incoming_hash !== rec.otp_hash) {
      const attempts = rec.attempts + 1;
      await supabase.from('otp_verifications').update({ attempts }).eq('id', rec.id);
      const left = Math.max(0, MAX_ATTEMPTS - attempts);
      return res.status(400).json({
        error: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` : 'Too many attempts. Please request a new code.',
      });
    }

    // Mark OTP verified + user verified
    await supabase.from('otp_verifications').update({ verified: true }).eq('id', rec.id);
    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, name, email, email_verified, created_at')
      .single();
    if (updErr) throw updErr;

    const token = signAccessToken(updated, { remember: false });
    return res.status(200).json({
      message: 'Email verified',
      token,
      user: updated,
    });
  } catch (err) {
    console.error('verify-email error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}
