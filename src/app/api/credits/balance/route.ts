import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { getCreditsBalance } from '@/lib/credits/service';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';
import { resolveCreditsPolicy } from '@/lib/credits/policy';

export async function GET(_request: NextRequest) {
  try {
    const { authenticated, userId, hasActiveSubscription } = await verifySession({ requireSubscription: false });

    if (!authenticated || !userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const balance = CREDITS_FEATURE_ENABLED ? await getCreditsBalance(userId) : null;
    const policy = resolveCreditsPolicy({ hasActiveSubscription: !!hasActiveSubscription });

    return NextResponse.json({
      enabled: CREDITS_FEATURE_ENABLED,
      balance,
      requiredForGeneration: policy.requiresCredits,
    });
  } catch (error) {
    console.error('Credits balance error:', error);
    return NextResponse.json({ error: 'Erro ao carregar créditos' }, { status: 500 });
  }
}
