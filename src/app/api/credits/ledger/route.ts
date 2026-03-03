import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth/verify-session';
import { getCreditsLedger } from '@/lib/credits/service';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const { authenticated, userId } = await verifySession({ requireSubscription: false });

    if (!authenticated || !userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const parsed = querySchema.safeParse({
      limit: request.nextUrl.searchParams.get('limit') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Query inválida', details: parsed.error.flatten() }, { status: 400 });
    }

    const entries = await getCreditsLedger(userId, parsed.data.limit);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Credits ledger error:', error);
    return NextResponse.json({ error: 'Erro ao carregar histórico de créditos' }, { status: 500 });
  }
}
