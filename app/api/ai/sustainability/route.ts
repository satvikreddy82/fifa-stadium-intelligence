import { NextRequest, NextResponse } from 'next/server';
import { generateSustainabilityInsights } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/utils';
import type { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    if (!checkRateLimit(`ai-sustainability:${ip}`, 8, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const body = await req.json() as { metrics?: Record<string, unknown>; language?: string };
    const insights = await generateSustainabilityInsights(body.metrics ?? {}, (body.language ?? 'en') as Language);
    return NextResponse.json({ insights, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
