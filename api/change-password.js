import supabase from './db-client.js';
import { cors, requireAuth, verifyPassword, hashPassword, passwordIssues } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const issues = passwordIssues(newPassword);
    if (issues.length) return res.status(400).json({ error: `Password requirements not met: ${issues.join(', ')}` });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', auth.sub)
      .single();
    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const ok = await verifyPassword(currentPassword || '', user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const password_hash = await hashPassword(newPassword);
    await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('change-password error:', err);
    return res.status(500).json({ error: 'Could not change password' });
  }
}
