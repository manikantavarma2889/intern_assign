import supabase from './db-client.js';
import { cors, verifyPassword, signAccessToken, validEmail, clientIp } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';

  try {
    const { email, password, remember } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!validEmail(cleanEmail) || !password) {
      return res.status(400).json({ error: 'Enter a valid email and password' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    const logAttempt = async (success, userId) => {
      await supabase.from('login_attempts').insert({
        user_id: userId || null,
        email: cleanEmail,
        ip_address: ip,
        user_agent: ua,
        success,
      });
    };

    if (!user) {
      await logAttempt(false, null);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Rate limit: too many recent failures
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentFails } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', cleanEmail)
      .eq('success', false)
      .gte('created_at', since);

    if ((recentFails || 0) >= 8) {
      await logAttempt(false, user.id);
      return res.status(429).json({ error: 'Too many failed attempts. Try again in a few minutes.' });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      await logAttempt(false, user.id);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.email_verified) {
      await logAttempt(false, user.id);
      return res.status(403).json({
        error: 'Please verify your email before signing in.',
        needsVerification: true,
        email: user.email,
      });
    }

    await logAttempt(true, user.id);

    const token = signAccessToken(user, { remember: !!remember });
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
