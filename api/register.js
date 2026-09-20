import supabase from './_helpers/db-client.js';
import { cors, hashPassword, validEmail, passwordIssues } from './_helpers/auth.js';
import { generateOtp, hashOtp } from './_helpers/otp.js';
import { sendOtpEmail } from './_helpers/email.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, password, confirmPassword } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanName || cleanName.length < 2) return res.status(400).json({ error: 'Name is required' });
    if (!validEmail(cleanEmail)) return res.status(400).json({ error: 'Invalid email address' });
    const issues = passwordIssues(password);
    if (issues.length) return res.status(400).json({ error: `Password requirements not met: ${issues.join(', ')}` });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

    // Check if verified user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing && existing.email_verified) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await hashPassword(password);

    let userId;
    if (existing) {
      // Not yet verified — update name/password and let them re-verify
      const { data: updated, error: updErr } = await supabase
        .from('users')
        .update({ name: cleanName, password_hash, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('id')
        .single();
      if (updErr) throw updErr;
      userId = updated.id;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('users')
        .insert({
          name: cleanName,
          email: cleanEmail,
          password_hash,
          email_verified: false,
        })
        .select('id')
        .single();
      if (insErr) throw insErr;
      userId = inserted.id;
    }

    // Invalidate old unverified OTPs for this user/purpose
    await supabase
      .from('otp_verifications')
      .update({ verified: true }) // effectively burns them
      .eq('user_id', userId)
      .eq('purpose', 'email_verify')
      .eq('verified', false);

    const otp = generateOtp();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpErr } = await supabase.from('otp_verifications').insert({
      user_id: userId,
      purpose: 'email_verify',
      otp_hash,
      expires_at,
      attempts: 0,
      verified: false,
    });
    if (otpErr) throw otpErr;

    const send = await sendOtpEmail({ to: cleanEmail, name: cleanName, otp, purpose: 'email_verify' });
    if (!send.sent) {
      return res.status(502).json({ error: send.error || 'Failed to send verification email.' });
    }

    return res.status(201).json({
      message: 'Verification OTP sent to your email',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
