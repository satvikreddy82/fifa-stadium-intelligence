import { NextRequest, NextResponse } from 'next/server';
import { generateCrowdSummary } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/utils';
import type { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    if (!checkRateLimit(`ai-crowd:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const body = await req.json() as { crowdData?: Record<string, unknown>; language?: string };
    const summary = await generateCrowdSummary(body.crowdData ?? {}, (body.language ?? 'en') as Language);
    return NextResponse.json({ summary, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
