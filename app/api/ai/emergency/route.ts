import { NextRequest, NextResponse } from 'next/server';
import { generateEmergencyInstructions } from '@/lib/gemini';
import { checkRateLimit, sanitizeInput } from '@/lib/utils';
import type { Language } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    if (!checkRateLimit(`ai-emergency:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json() as { situation?: string; location?: string; language?: string };
    const situation = sanitizeInput(body.situation ?? 'general emergency');
    const location = sanitizeInput(body.location ?? 'stadium');
    const language = (body.language ?? 'en') as Language;

    const instructions = await generateEmergencyInstructions(situation, location, language);
    return NextResponse.json({ instructions, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
