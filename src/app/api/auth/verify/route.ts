import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/db';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/config';
import { getCreditsBalance } from '@/lib/credits/service';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';
import { resolveCreditsPolicy } from '@/lib/credits/policy';
import { logStartTrialCheckpoint } from '@/lib/analytics/meta';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    logStartTrialCheckpoint('auth_verify_request_received', {
      hasSessionToken: !!sessionToken,
      creditsEnabled: CREDITS_FEATURE_ENABLED,
    });

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    const result = await getSessionUser(sessionToken);
    logStartTrialCheckpoint('auth_verify_session_user_resolved', {
      foundSessionUser: !!result?.user,
      userId: result?.user?.id || null,
    });

    if (!result) {
      return NextResponse.json({ authenticated: false });
    }

    if (CREDITS_FEATURE_ENABLED) {
      logStartTrialCheckpoint('auth_verify_credits_balance_fetch_start', { userId: result.user.id });
    }

    const creditsBalance = CREDITS_FEATURE_ENABLED
      ? await getCreditsBalance(result.user.id)
      : null;

    if (CREDITS_FEATURE_ENABLED) {
      logStartTrialCheckpoint('auth_verify_credits_balance_fetch_done', {
        userId: result.user.id,
        creditsBalance,
      });
    }

    const creditsPolicy = resolveCreditsPolicy({ hasActiveSubscription: !!result.subscription });

    return NextResponse.json({
      authenticated: true,
      user: result.user,
      subscription: result.subscription,
      hasActiveSubscription: !!result.subscription,
      credits: {
        enabled: CREDITS_FEATURE_ENABLED,
        balance: creditsBalance,
        requiredForGeneration: creditsPolicy.requiresCredits,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
