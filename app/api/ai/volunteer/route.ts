import { NextRequest, NextResponse } from 'next/server';
import { generateVolunteerResponse } from '@/lib/gemini';
import { checkRateLimit, sanitizeInput } from '@/lib/utils';
import type { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    if (!checkRateLimit(`ai-volunteer:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const body = await req.json() as { query?: string; context?: string; language?: string };
    const query = sanitizeInput(body.query ?? '');
    const context = sanitizeInput(body.context ?? 'Stadium volunteer assistant');
    const language = (body.language ?? 'en') as Language;
    const response = await generateVolunteerResponse(query, context, language);
    return NextResponse.json({ response, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
