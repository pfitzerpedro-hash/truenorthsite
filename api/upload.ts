import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { supabase } from './_lib/supabase';
import { verifyToken } from './_lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_PROMPT = `You are an expert Brazilian customs (Receita Federal / DUIMP) specialist.
Analyze this commercial invoice document and extract ALL data.
Return ONLY a valid JSON object — no markdown, no explanation, just JSON.

Required structure:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD or empty string",
  "supplier": { "name": "string", "address": "string", "country": "string" },
  "buyer": { "name": "string", "cnpj": "string" },
  "incoterm": "FOB/CIF/EXW/etc or null",
  "currency": "USD/EUR/BRL/etc",
  "total_value": number,
  "freight": number or null,
  "insurance": number or null,
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unit": "UN/KG/PC/etc",
      "unit_price": number,
      "total_price": number,
      "ncm_sugerido": "8-digit NCM code or null",
      "ncm_descricao": "NCM description in Portuguese",
      "ncm_confianca": "ALTA or MEDIA or BAIXA",
      "ncm_fonte": "documento or recomendado",
      "peso_kg": number or null,
      "origem": "country of origin or null",
      "anuentes_necessarios": []
    }
  ],
  "observacoes": [],
  "campos_faltando": [],
  "setor_detectado": "Eletrônicos/Maquinário/Alimentos/Vestuário/Químicos/Outros",
  "anuentes_operacao": [],
  "feedback_especialista": "string",
  "impostos_estimados": {
    "ii": number,
    "ipi": number,
    "pis_cofins": number,
    "total_impostos": number,
    "base_calculo": number
  },
  "alerta_subfaturamento": null
}`;

function parseForm(req: VercelRequest): Promise<{ file: FormidableFile }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 20 * 1024 * 1024,
      keepExtensions: true,
    });
    form.parse(req as any, (err, _fields, files) => {
      if (err) return reject(new Error('Falha ao receber arquivo: ' + err.message));
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) return reject(new Error('Nenhum arquivo encontrado na requisição'));
      resolve({ file });
    });
  });
}

async function extractWithClaude(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<any> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // --- XML: parse as plain text ---
  if (mimeType === 'text/xml' || mimeType === 'application/xml' || ext === 'xml') {
    const xmlText = fileBuffer.toString('utf-8');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: `Extract invoice data from this XML document:\n\n${xmlText.slice(0, 50000)}`,
      }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  }

  // --- PDF: use Anthropic beta document API ---
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    const base64 = fileBuffer.toString('base64');
    const response = await (anthropic as any).beta.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          { type: 'text', text: 'Extract all invoice data and return only valid JSON.' },
        ],
      }],
      betas: ['pdfs-2024-09-25'],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  }

  // --- Image (JPEG, PNG, GIF, WEBP) ---
  const imageTypes: Record<string, string> = {
    'image/jpeg': 'image/jpeg', 'image/jpg': 'image/jpeg',
    'image/png': 'image/png', 'image/gif': 'image/gif',
    'image/webp': 'image/webp',
  };
  const resolvedMime = imageTypes[mimeType] || (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : null);

  if (resolvedMime) {
    const base64 = fileBuffer.toString('base64');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: resolvedMime as any, data: base64 },
          },
          { type: 'text', text: 'Extract all invoice data and return only valid JSON.' },
        ],
      }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  }

  throw new Error(`Tipo de arquivo não suportado: ${mimeType || ext}. Use PDF, XML ou imagem (JPEG, PNG).`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  // Parse file
  let file: FormidableFile;
  try {
    ({ file } = await parseForm(req));
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  const fileName = file.originalFilename || file.newFilename || 'invoice';
  const mimeType = file.mimetype || '';
  let fileBuffer: Buffer;

  try {
    fileBuffer = fs.readFileSync(file.filepath);
  } catch {
    return res.status(400).json({ error: 'Erro ao ler arquivo enviado' });
  }

  // Check file size (max 10MB for AI processing)
  if (fileBuffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
  }

  // Upload to Supabase Storage (non-blocking)
  const storagePath = `${userId}/${Date.now()}_${fileName}`;
  supabase.storage.from('invoices').upload(storagePath, fileBuffer, { contentType: mimeType }).catch(() => {});

  // AI extraction
  const startTime = Date.now();
  let extractedData: any;

  try {
    extractedData = await extractWithClaude(fileBuffer, mimeType, fileName);
  } catch (aiError: any) {
    const msg = aiError?.message || String(aiError);
    console.error('AI extraction error:', msg);

    if (msg.includes('não suportado')) {
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({
      error: 'Erro ao processar documento com IA. Verifique se o arquivo está legível e tente novamente.',
    });
  } finally {
    try { fs.unlinkSync(file.filepath); } catch {}
  }

  // Save to Supabase
  const { data: operation, error: dbError } = await supabase
    .from('operations')
    .insert({
      user_id: userId,
      arquivo_nome: fileName,
      arquivo_tipo: mimeType,
      arquivo_url: storagePath,
      status: 'completed',
      dados_extraidos: extractedData,
      tempo_economizado_min: 17,
      erros: [],
    })
    .select()
    .single();

  if (dbError) {
    console.error('DB error:', dbError);
    return res.status(500).json({ error: 'Erro ao salvar operação no banco de dados' });
  }

  return res.json({
    operationId: operation.id,
    file: { name: fileName },
    dadosExtraidos: extractedData,
    status: 'completed',
    processingTimeMs: Date.now() - startTime,
  });
}
