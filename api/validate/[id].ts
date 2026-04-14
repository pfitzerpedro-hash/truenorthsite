import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { verifyToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  const operationId = req.query.id as string;
  const { data: op } = await supabase.from('operations').select('*').eq('id', operationId).eq('user_id', userId).single();
  if (!op) return res.status(404).json({ error: 'Operação não encontrada' });

  const data = op.dados_extraidos || {};
  const items = data.items || [];
  const validacoes: any[] = [];
  const erros: any[] = [];
  let custoMultas = 0;
  let custoDemurrage = 0;

  // Validate NCMs
  items.forEach((item: any, idx: number) => {
    const ncm = (item.ncm_sugerido || '').replace(/\D/g, '');
    if (!ncm || ncm.length !== 8) {
      validacoes.push({
        campo: `Item ${idx + 1} - NCM`,
        valor_encontrado: item.ncm_sugerido,
        valor_esperado: '8 dígitos',
        status: 'ERRO',
        codigo_erro: 'NCM_INVALIDO',
        explicacao: `NCM inválido para "${item.description}"`,
        fonte: 'Regra NCM Brasil',
        sugestao_correcao: 'Verifique e corrija o código NCM de 8 dígitos',
      });
      erros.push({
        tipo_erro: 'NCM_INVALIDO',
        campo: `items[${idx}].ncm`,
        valor_original: item.ncm_sugerido,
        valor_esperado: '00000000',
        explicacao: 'NCM deve ter exatamente 8 dígitos',
        fonte: 'SISCOMEX',
        custo_estimado: 1500,
        severidade: 'ALTO',
      });
      custoMultas += 1500;
      custoDemurrage += 200;
    } else {
      validacoes.push({
        campo: `Item ${idx + 1} - NCM`,
        valor_encontrado: ncm,
        valor_esperado: ncm,
        status: item.ncm_confianca === 'BAIXA' ? 'ALERTA' : 'OK',
        explicacao: item.ncm_confianca === 'BAIXA' ? 'Confiança baixa na classificação' : 'NCM válido',
        fonte: 'Classificação IA',
      });
    }
  });

  // Validate invoice number
  if (!data.invoice_number) {
    validacoes.push({ campo: 'Número da Invoice', valor_encontrado: null, valor_esperado: 'string', status: 'ALERTA', explicacao: 'Número da invoice não encontrado', fonte: 'Documento' });
  }

  // Validate incoterm
  const validIncoterms = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
  if (!data.incoterm || !validIncoterms.includes(data.incoterm?.toUpperCase())) {
    validacoes.push({ campo: 'Incoterm', valor_encontrado: data.incoterm, valor_esperado: validIncoterms.join('/'), status: 'ALERTA', explicacao: 'Incoterm inválido ou ausente', fonte: 'ICC Incoterms 2020' });
  } else {
    validacoes.push({ campo: 'Incoterm', valor_encontrado: data.incoterm, valor_esperado: data.incoterm, status: 'OK', explicacao: 'Incoterm válido', fonte: 'ICC Incoterms 2020' });
  }

  const custoTotal = custoMultas + custoDemurrage;
  const diasAtraso = Math.ceil(custoDemurrage / 200);
  const risco = erros.length === 0 ? 'BAIXO' : erros.length <= 2 ? 'MEDIO' : erros.length <= 4 ? 'ALTO' : 'CRITICO';

  // Save validation result
  const validationResult = {
    validacoes,
    erros,
    custos: {
      custoMultas,
      custoDemurrage,
      custoTotal,
      diasAtrasoEstimado: diasAtraso,
      detalhamento: erros.map(e => ({
        erro: e.tipo_erro,
        custoMulta: e.custo_estimado || 0,
        custoDemurrage: 200,
        diasAtraso: 1,
        calculo: `R$ ${e.custo_estimado || 0} multa + R$ 200 demurrage`,
      })),
    },
    anuentes_necessarios: data.anuentes_operacao || [],
    risco_geral: risco,
  };

  await supabase.from('operations').update({
    dados_validados: validationResult,
    erros: erros,
    custo_total_erros: custoTotal,
  }).eq('id', operationId);

  return res.json({ ...validationResult, operationId });
}
