import supabase from './_helpers/db-client.js';
import { cors, requireAuth } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, email_verified, created_at, updated_at')
    .eq('id', auth.sub)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json({ user });
}
