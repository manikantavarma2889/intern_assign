import supabase from './db-client.js';
import { cors, requireAuth } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { name } = req.body || {};
    const cleanName = String(name || '').trim();
    if (cleanName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });

    const { data, error } = await supabase
      .from('users')
      .update({ name: cleanName, updated_at: new Date().toISOString() })
      .eq('id', auth.sub)
      .select('id, name, email, email_verified, created_at, updated_at')
      .single();

    if (error) throw error;
    return res.status(200).json({ user: data });
  } catch (err) {
    console.error('update-profile error:', err);
    return res.status(500).json({ error: 'Could not update profile' });
  }
}
