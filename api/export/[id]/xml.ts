import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { verifyToken } from '../../_lib/auth';

function buildXml(data: any): string {
  const items = (data.itens || []).map((item: any, i: number) => `
    <item sequencial="${i + 1}">
      <ncm>${item.ncm}</ncm>
      <descricao>${item.descricao}</descricao>
      <quantidade>${item.quantidade}</quantidade>
      <unidade>${item.unidade}</unidade>
      <valorUnitario>${item.valorUnitario?.toFixed(2)}</valorUnitario>
      <valorTotal>${item.valorTotal?.toFixed(2)}</valorTotal>
      <pesoLiquido>${item.pesoLiquido?.toFixed(3)}</pesoLiquido>
      <paisOrigem>${item.paisOrigem}</paisOrigem>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<DUIMP xmlns="http://www.portalunico.siscomex.gov.br" version="1.0">
  <declaracao>
    <numeroReferencia>${data.numeroReferencia}</numeroReferencia>
    <dataEmbarque>${data.dataEmbarque}</dataEmbarque>
    <incoterm>${data.incoterm}</incoterm>
    <moeda>${data.moeda}</moeda>
    <codigoURF>${data.codigoURF}</codigoURF>
    <viaTransporte>${data.viaTransporte}</viaTransporte>
    <tipoDeclaracao>${data.tipoDeclaracao}</tipoDeclaracao>
    <importador>
      <cnpj>${data.importador?.cnpj}</cnpj>
      <nome>${data.importador?.nome}</nome>
      <uf>${data.importador?.uf}</uf>
    </importador>
    <exportador>
      <nome>${data.exportador?.nome}</nome>
      <pais>${data.exportador?.pais}</pais>
    </exportador>
    <itens>${items}
    </itens>
    <totais>
      <valorMercadoria>${data.totais?.valorMercadoria?.toFixed(2)}</valorMercadoria>
      <frete>${data.totais?.frete?.toFixed(2)}</frete>
      <seguro>${data.totais?.seguro?.toFixed(2)}</seguro>
      <valorAduaneiro>${data.totais?.valorAduaneiro?.toFixed(2)}</valorAduaneiro>
    </totais>
  </declaracao>
</DUIMP>`;
}

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

  const items = (d.items || []).map((item: any, idx: number) => ({
    ncm: (item.ncm_editado || item.ncm_sugerido || '').replace(/\D/g, ''),
    descricao: item.description || '',
    quantidade: item.quantity || 0,
    unidade: item.unit || 'UN',
    valorUnitario: item.unit_price || 0,
    valorTotal: item.total_price || 0,
    pesoLiquido: item.peso_kg || 0,
    paisOrigem: item.origem || 'CHN',
  }));

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
    itens: items,
    totais: {
      valorMercadoria: d.total_value || 0,
      frete: d.freight || 0,
      seguro: d.insurance || 0,
      valorAduaneiro: (d.total_value || 0) + (d.freight || 0) + (d.insurance || 0),
    },
  };

  const xml = buildXml(exportData);
  const filename = `duimp_${operationId}.xml`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(xml);
}
