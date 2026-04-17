import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { supabase } from './_lib/supabase';
import { verifyToken } from './_lib/auth';
import * as fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

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
  } finally {
    try { fs.unlinkSync(file.filepath); } catch {}
  }

  if (fileBuffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
  }

  // Upload to Supabase Storage (non-blocking)
  const storagePath = `${userId}/${Date.now()}_${fileName}`;
  supabase.storage.from('invoices').upload(storagePath, fileBuffer, { contentType: mimeType }).catch(() => {});

  // Call n8n webhook for AI processing
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    return res.status(500).json({ error: 'Webhook n8n não configurado. Adicione N8N_WEBHOOK_URL nas variáveis de ambiente do Vercel.' });
  }

  const fileBase64 = fileBuffer.toString('base64');
  const startTime = Date.now();

  let n8nResponse: any;
  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        fileName,
        mimeType,
        fileBase64,
        storagePath,
        startTime,
      }),
    });

    const rawText = await response.text();
    console.log('n8n response status:', response.status);
    console.log('n8n response body:', rawText.slice(0, 500));

    if (!response.ok) {
      return res.status(500).json({ error: 'n8n retornou erro ' + response.status + ': ' + rawText.slice(0, 300) });
    }

    try {
      n8nResponse = JSON.parse(rawText);
    } catch {
      console.error('n8n body não é JSON:', rawText.slice(0, 500));
      return res.status(500).json({ error: 'n8n retornou resposta inválida: ' + rawText.slice(0, 200) });
    }
  } catch (err: any) {
    console.error('n8n fetch error:', err.message);
    return res.status(500).json({ error: 'Não foi possível conectar ao n8n: ' + err.message });
  }

  return res.json(n8nResponse);
}
