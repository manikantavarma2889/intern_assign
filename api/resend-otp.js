import supabase from './_helpers/db-client.js';
import { cors } from './_helpers/auth.js';
import { generateOtp, hashOtp } from './_helpers/otp.js';
import { sendOtpEmail } from './_helpers/email.js';

const COOLDOWN_MS = 60 * 1000; // 60s

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, purpose } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const purposeVal = purpose === 'password_reset' ? 'password_reset' : 'email_verify';

    if (!cleanEmail) return res.status(400).json({ error: 'Email is required' });

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    // For password reset, don't reveal existence
    if (!user) {
      if (purposeVal === 'password_reset') {
        return res.status(200).json({ message: 'If an account exists, a new code has been sent.' });
      }
      return res.status(400).json({ error: 'No account found for this email' });
    }

    if (purposeVal === 'email_verify' && user.email_verified) {
      return res.status(400).json({ error: 'This email is already verified.' });
    }

    // Check most recent OTP for cooldown
    const { data: latest } = await supabase
      .from('otp_verifications')
      .select('id, created_at, verified')
      .eq('user_id', user.id)
      .eq('purpose', purposeVal)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const age = Date.now() - new Date(latest.created_at).getTime();
      if (age < COOLDOWN_MS) {
        const wait = Math.ceil((COOLDOWN_MS - age) / 1000);
        return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.`, cooldown: wait });
      }
    }

    // Burn old unverified OTPs
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('user_id', user.id)
      .eq('purpose', purposeVal)
      .eq('verified', false);

    const otp = generateOtp();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpErr } = await supabase.from('otp_verifications').insert({
      user_id: user.id,
      purpose: purposeVal,
      otp_hash,
      expires_at,
      attempts: 0,
      verified: false,
    });
    if (otpErr) throw otpErr;

    const send = await sendOtpEmail({ to: cleanEmail, name: user.name, otp, purpose: purposeVal });
    if (!send.sent) {
      return res.status(502).json({ error: send.error || 'Failed to send email.' });
    }

    return res.status(200).json({
      message: 'A new code has been sent.',
    });
  } catch (err) {
    console.error('resend-otp error:', err);
    return res.status(500).json({ error: 'Could not resend code.' });
  }
}
