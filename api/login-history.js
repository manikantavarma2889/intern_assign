import supabase from './_helpers/db-client.js';
import { cors, requireAuth } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = requireAuth(req, res);
  if (!auth) return;

  const { data, error } = await supabase
    .from('login_attempts')
    .select('id, ip_address, user_agent, success, created_at')
    .eq('user_id', auth.sub)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ history: data });
}
