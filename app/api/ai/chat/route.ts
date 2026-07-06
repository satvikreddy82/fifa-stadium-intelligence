import { NextRequest, NextResponse } from 'next/server';
import { generateStadiumAIResponse } from '@/lib/gemini';
import { checkRateLimit, sanitizeInput } from '@/lib/utils';
import type { Language } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
    if (!checkRateLimit(`ai-chat:${ip}`, 15, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json() as {
      message?: unknown;
      history?: unknown;
      language?: unknown;
      context?: unknown;
    };

    const message = typeof body.message === 'string' ? sanitizeInput(body.message) : '';
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const language = (typeof body.language === 'string' ? body.language : 'en') as Language;
    const context = typeof body.context === 'object' ? (body.context as Record<string, unknown>) : undefined;

    const reply = await generateStadiumAIResponse(message, history, language, context);

    return NextResponse.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Chat API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
