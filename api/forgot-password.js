import supabase from './db-client.js';
import { cors, validEmail } from './_helpers/auth.js';
import { generateOtp, hashOtp } from './_helpers/otp.js';
import { sendOtpEmail } from './_helpers/email.js';

const COOLDOWN_MS = 60 * 1000;

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!validEmail(cleanEmail)) return res.status(400).json({ error: 'Enter a valid email' });

    // Neutral response to avoid account enumeration
    const neutral = { message: 'If an account exists for this email, a password reset code has been sent.' };

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!user) return res.status(200).json(neutral);

    // Cooldown
    const { data: latest } = await supabase
      .from('otp_verifications')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('purpose', 'password_reset')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const age = Date.now() - new Date(latest.created_at).getTime();
      if (age < COOLDOWN_MS) {
        return res.status(200).json(neutral); // still neutral
      }
    }

    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('user_id', user.id)
      .eq('purpose', 'password_reset')
      .eq('verified', false);

    const otp = generateOtp();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase.from('otp_verifications').insert({
      user_id: user.id,
      purpose: 'password_reset',
      otp_hash,
      expires_at,
      attempts: 0,
      verified: false,
    });

    const send = await sendOtpEmail({ to: cleanEmail, name: user.name, otp, purpose: 'password_reset' });
    if (!send.sent) {
      return res.status(502).json({ error: send.error || 'Failed to send reset email.' });
    }

    return res.status(200).json(neutral);
  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ error: 'Could not process request.' });
  }
}
