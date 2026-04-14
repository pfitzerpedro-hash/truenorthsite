import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { supabase } from './_lib/supabase';
import { verifyToken } from './_lib/auth';
import OpenAI from 'openai';
import * as fs from 'fs';

export const config = { api: { bodyParser: false } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 3 });

const EXTRACTION_PROMPT = `You are an expert Brazilian customs (Receita Federal) specialist.
Analyze this commercial invoice and extract ALL data in the following JSON format.
Respond ONLY with valid JSON, no markdown, no explanations.

Required JSON structure:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "supplier": { "name": "string", "address": "string", "country": "string" },
  "buyer": { "name": "string", "cnpj": "string" },
  "incoterm": "string or null (e.g. FOB, CIF, EXW)",
  "currency": "string (e.g. USD, EUR)",
  "total_value": number,
  "freight": number or null,
  "insurance": number or null,
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unit": "string (e.g. UN, KG, PC)",
      "unit_price": number,
      "total_price": number,
      "ncm_sugerido": "8-digit NCM code or null",
      "ncm_descricao": "string description of NCM",
      "ncm_confianca": "ALTA or MEDIA or BAIXA",
      "ncm_fonte": "documento or recomendado",
      "peso_kg": number or null,
      "origem": "country of origin or null",
      "anuentes_necessarios": ["ANVISA", "ANATEL", etc. - only if applicable]
    }
  ],
  "observacoes": ["list of important observations"],
  "campos_faltando": ["list of missing required fields"],
  "setor_detectado": "e.g. Eletrônicos, Vestuário, Maquinário, Alimentos, Químicos",
  "anuentes_operacao": ["list of applicable regulatory bodies"],
  "feedback_especialista": "string with expert compliance notes",
  "impostos_estimados": {
    "ii": number (import tax estimate),
    "ipi": number,
    "pis_cofins": number,
    "total_impostos": number,
    "base_calculo": number
  },
  "alerta_subfaturamento": "string warning if values seem too low, or null"
}

Important rules:
- NCM codes must be 8 digits for Brazil
- For electronics: check ANATEL requirements
- For food/pharma: check ANVISA requirements
- For chemicals: check IBAMA requirements
- Estimate taxes: II average 10-20%, IPI 5-15%, PIS/COFINS ~9.25% of base
- base_calculo = (total_value + freight + insurance) * current BRL rate approximation
- Flag subfaturamento if unit prices seem below market value`;

async function parseForm(req: VercelRequest): Promise<{ file: FormidableFile; fields: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) return reject(new Error('Nenhum arquivo enviado'));
      resolve({ file, fields });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = await verifyToken(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária' });

  let file: FormidableFile;
  try {
    const parsed = await parseForm(req);
    file = parsed.file;
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao processar arquivo' });
  }

  const fileName = file.originalFilename || file.newFilename || 'invoice';
  const mimeType = file.mimetype || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(file.filepath);
  const base64 = fileBuffer.toString('base64');

  // Upload to Supabase Storage
  const storagePath = `${userId}/${Date.now()}_${fileName}`;
  await supabase.storage.from('invoices').upload(storagePath, fileBuffer, { contentType: mimeType });

  // Build OpenAI message content
  const isImage = mimeType.startsWith('image/');
  const mediaType = isImage ? mimeType : 'application/pdf';
  const dataUrl = `data:${mediaType};base64,${base64}`;

  let extractedData: any;
  const startTime = Date.now();

  try {
    const messages: any[] = [
      { role: 'system', content: EXTRACTION_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all invoice data from this document:' },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 4000,
      temperature: 0.1,
    });

    const content = completion.choices[0].message.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    extractedData = JSON.parse(cleaned);
  } catch (aiError: any) {
    console.error('AI extraction error:', aiError);
    const isRateLimit = aiError?.status === 429 || aiError?.message?.includes('Rate limit');
    return res.status(500).json({
      error: isRateLimit
        ? 'Limite de requisições atingido. Aguarde 30 segundos e tente novamente.'
        : 'Erro ao processar documento com IA. Tente novamente.',
    });
  }

  const processingTime = Date.now() - startTime;

  // Save operation to Supabase
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
    return res.status(500).json({ error: 'Erro ao salvar operação' });
  }

  // Clean up temp file
  try { fs.unlinkSync(file.filepath); } catch {}

  return res.json({
    operationId: operation.id,
    file: { name: fileName },
    dadosExtraidos: extractedData,
    status: 'completed',
    processingTimeMs: processingTime,
  });
}
