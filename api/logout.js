import { cors } from './_helpers/auth.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Stateless JWT — the client discards the token. A revocation table
  // could be added here for a server-side blocklist.
  return res.status(200).json({ message: 'Logged out' });
}
