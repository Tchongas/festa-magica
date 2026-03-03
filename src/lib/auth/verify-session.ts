import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/supabase/db';
import { SESSION_COOKIE_NAME } from '@/lib/config';

interface VerifySessionOptions {
  requireSubscription?: boolean;
}

interface VerifySessionResult {
  authenticated: boolean;
  userId?: string;
  hasActiveSubscription?: boolean;
}

export async function verifySession(options: VerifySessionOptions = {}): Promise<VerifySessionResult> {
  const { requireSubscription = true } = options;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return { authenticated: false };
    }

    const result = await getSessionUser(sessionToken);

    if (!result) {
      return { authenticated: false };
    }

    const hasActiveSubscription = !!result.subscription;
    if (requireSubscription && !hasActiveSubscription) {
      return { authenticated: false, userId: result.user.id, hasActiveSubscription };
    }

    return {
      authenticated: true,
      userId: result.user.id,
      hasActiveSubscription,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { authenticated: false };
  }
}
