import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.user.id).single();

  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.user_metadata?.name || null,
      createdAt: data.user.created_at,
    },
    token: data.session.access_token,
  });
}
