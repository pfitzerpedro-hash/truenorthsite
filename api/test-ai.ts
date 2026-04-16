import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const keyPreview = process.env.ANTHROPIC_API_KEY
    ? process.env.ANTHROPIC_API_KEY.slice(0, 20) + '...'
    : 'NOT SET';

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return res.json({ status: 'ok', model: 'claude-sonnet-4-6', response: text, keyPreview });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      keyPreview,
      errorStatus: err?.status,
      errorMessage: err?.message,
      errorBody: err?.error || err?.headers || {},
    });
  }
}
