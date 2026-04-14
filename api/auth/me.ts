import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { verifyToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Token inválido ou expirado' });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

  return res.json({
    user: {
      id: userId,
      email: profile?.email || '',
      name: profile?.name || null,
      createdAt: profile?.created_at,
    },
  });
}
