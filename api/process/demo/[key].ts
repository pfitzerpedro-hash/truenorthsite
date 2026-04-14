import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';

const DEMOS: Record<string, any> = {
  eletronicos: {
    invoice_number: 'INV-2025-00142', invoice_date: '2025-03-15',
    supplier: { name: 'Shenzhen Tech Electronics Co., Ltd.', address: 'Shenzhen, Guangdong', country: 'China' },
    buyer: { name: 'Importadora Paulista Ltda', cnpj: '12.345.678/0001-99' },
    incoterm: 'FOB', currency: 'USD', total_value: 45000, freight: 2500, insurance: 450,
    items: [
      { description: 'Smartphone Android 6.5" 128GB', quantity: 100, unit: 'UN', unit_price: 180, total_price: 18000,
        ncm_sugerido: '85171299', ncm_descricao: 'Outros aparelhos telefônicos', ncm_confianca: 'ALTA', ncm_fonte: 'recomendado', peso_kg: 0.18, origem: 'China', anuentes_necessarios: ['ANATEL'] },
      { description: 'Fone de Ouvido Bluetooth TWS', quantity: 200, unit: 'UN', unit_price: 25, total_price: 5000,
        ncm_sugerido: '85183000', ncm_descricao: 'Fones de ouvido', ncm_confianca: 'ALTA', ncm_fonte: 'recomendado', peso_kg: 0.05, origem: 'China', anuentes_necessarios: ['ANATEL'] },
      { description: 'Carregador USB-C 65W GaN', quantity: 300, unit: 'UN', unit_price: 12, total_price: 3600,
        ncm_sugerido: '85044030', ncm_descricao: 'Carregadores de bateria', ncm_confianca: 'ALTA', ncm_fonte: 'recomendado', peso_kg: 0.12, origem: 'China', anuentes_necessarios: ['INMETRO'] },
    ],
    setor_detectado: 'Eletrônicos', anuentes_operacao: ['ANATEL', 'INMETRO'],
    feedback_especialista: 'Verifique certificação ANATEL para todos os itens. Fones TWS precisam de homologação específica.',
    impostos_estimados: { ii: 8550, ipi: 2280, pis_cofins: 4278, total_impostos: 15108, base_calculo: 47950 },
    observacoes: ['Todos itens requerem certificação ANATEL', 'Verificar se importador possui habilitação RADAR'],
    campos_faltando: [],
  },
  maquinario: {
    invoice_number: 'INV-DE-2025-0087', invoice_date: '2025-02-28',
    supplier: { name: 'Müller Maschinenbau GmbH', address: 'Stuttgart, Baden-Württemberg', country: 'Alemanha' },
    buyer: { name: 'Metalúrgica Brasileira S.A.', cnpj: '98.765.432/0001-11' },
    incoterm: 'CIF', currency: 'EUR', total_value: 125000, freight: 0, insurance: 0,
    items: [
      { description: 'Centro de Usinagem CNC 5 Eixos', quantity: 1, unit: 'UN', unit_price: 98000, total_price: 98000,
        ncm_sugerido: '84571000', ncm_descricao: 'Centros de usinagem para trabalhar metais', ncm_confianca: 'ALTA', ncm_fonte: 'recomendado', peso_kg: 8500, origem: 'Alemanha', anuentes_necessarios: [] },
      { description: 'Kit de Ferramentas de Corte HSS', quantity: 5, unit: 'KIT', unit_price: 3500, total_price: 17500,
        ncm_sugerido: '82079090', ncm_descricao: 'Outras ferramentas intercambiáveis', ncm_confianca: 'MEDIA', ncm_fonte: 'recomendado', peso_kg: 45, origem: 'Alemanha', anuentes_necessarios: [] },
    ],
    setor_detectado: 'Maquinário Industrial', anuentes_operacao: [],
    feedback_especialista: 'Ex-tarifário pode reduzir II para 0% em máquinas sem similar nacional. Verifique CAMEX.',
    impostos_estimados: { ii: 12500, ipi: 3750, pis_cofins: 9690, total_impostos: 25940, base_calculo: 125000 },
    observacoes: ['Verificar possibilidade de Ex-tarifário', 'Frete incluso no CIF'],
    campos_faltando: [],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.query.key as string;
  const demoData = DEMOS[key] || DEMOS.eletronicos;

  // Try to save demo operation (not required if user is not logged in)
  let operationId = `demo_${Date.now()}`;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: op } = await supabase.from('operations').insert({
          user_id: user.id,
          arquivo_nome: `demo_${key}.pdf`,
          arquivo_tipo: 'application/pdf',
          status: 'completed',
          dados_extraidos: demoData,
          tempo_economizado_min: 17,
          erros: [],
        }).select().single();
        if (op) operationId = op.id;
      }
    }
  } catch {}

  return res.json({ operationId, extractedData: demoData });
}
