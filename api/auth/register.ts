import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, confirmPassword, name } = req.body || {};

  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Senhas não coincidem' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name: name || null },
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }
    return res.status(400).json({ error: createError.message });
  }

  await supabase.from('profiles').upsert({
    id: user.user.id,
    email: user.user.email!,
    name: name || null,
  });

  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !signIn.session) return res.status(500).json({ error: 'Erro ao autenticar após cadastro' });

  return res.status(201).json({
    user: { id: user.user.id, email: user.user.email!, name: name || null, createdAt: user.user.created_at },
    token: signIn.session.access_token,
  });
}
