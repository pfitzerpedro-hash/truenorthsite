import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { verifyToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  if (req.method === 'GET') {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, count, error } = await supabase
      .from('operations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return res.status(500).json({ error: error.message });

    const operations = (data || []).map(op => ({
      id: op.id,
      arquivoNome: op.arquivo_nome,
      arquivoTipo: op.arquivo_tipo,
      status: op.status,
      dadosExtraidos: op.dados_extraidos,
      dadosValidados: op.dados_validados,
      erros: op.erros || [],
      custoTotalErros: op.custo_total_erros,
      tempoEconomizadoMin: op.tempo_economizado_min,
      createdAt: op.created_at,
    }));

    return res.json({ operations, total: count || 0, limit, offset });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
