import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { verifyToken } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  const { data, count } = await supabase
    .from('operations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  const ops = data || [];
  const withErrors = ops.filter(op => op.erros && op.erros.length > 0).length;
  const validated = ops.filter(op => op.dados_validados).length;
  const totalCosts = ops.reduce((sum, op) => sum + (op.custo_total_erros || 0), 0);
  const totalTime = ops.reduce((sum, op) => sum + (op.tempo_economizado_min || 17), 0);

  return res.json({
    totalOperations: count || 0,
    operationsWithErrors: withErrors,
    operationsValidated: validated,
    totalCostsAvoided: totalCosts,
    totalTimeSavedMin: totalTime,
    averageTimeSavedMin: ops.length > 0 ? totalTime / ops.length : 17,
  });
}
