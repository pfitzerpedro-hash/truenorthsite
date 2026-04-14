import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { verifyToken } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  const operationId = req.query.id as string;
  const { data: op } = await supabase.from('operations').select('*').eq('id', operationId).eq('user_id', userId).single();
  if (!op) return res.status(404).json({ error: 'Operação não encontrada' });

  const body = req.method === 'POST' ? (req.body || {}) : {};
  const overrides = body.overrides || {};
  const d = op.dados_extraidos || {};
  const items = d.items || [];

  const validationErrors: string[] = [];
  const exportItems = items.map((item: any, idx: number) => {
    const ncm = (item.ncm_editado || item.ncm_sugerido || '').replace(/\D/g, '');
    if (!ncm || ncm.length !== 8) validationErrors.push(`Item ${idx + 1}: NCM inválido`);
    return {
      sequencial: idx + 1,
      ncm,
      descricao: item.description || '',
      quantidade: item.quantity || 0,
      unidade: item.unit || 'UN',
      valorUnitario: item.unit_price || 0,
      valorTotal: item.total_price || 0,
      pesoLiquido: item.peso_kg || 0,
      pesoBruto: (item.peso_kg || 0) * 1.05,
      paisOrigem: item.origem || 'CHN',
      anuentes: item.anuentes_necessarios || [],
    };
  });

  const exportData = {
    numeroReferencia: overrides.numeroReferencia || d.invoice_number || '',
    dataEmbarque: overrides.dataEmbarque || d.invoice_date || '',
    incoterm: overrides.incoterm || d.incoterm || 'FOB',
    moeda: overrides.moeda || d.currency || 'USD',
    codigoURF: overrides.codigo_urf || 'BRSSS',
    viaTransporte: overrides.via_transporte || 'MARITIMO',
    tipoDeclaracao: overrides.tipo_declaracao || 'CONSUMO',
    importador: { cnpj: overrides.importador?.cnpj || d.buyer?.cnpj || '', nome: overrides.importador?.nome || d.buyer?.name || '', uf: overrides.importador?.uf || '' },
    exportador: { nome: d.supplier?.name || '', pais: d.supplier?.country || '' },
    itens: exportItems,
    totais: {
      valorMercadoria: d.total_value || 0,
      frete: d.freight || 0,
      seguro: d.insurance || 0,
      valorAduaneiro: (d.total_value || 0) + (d.freight || 0) + (d.insurance || 0),
    },
  };

  return res.json({ exportData, validationErrors, isValid: validationErrors.length === 0 });
}
