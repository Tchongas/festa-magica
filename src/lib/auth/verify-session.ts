import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/supabase/db';

export async function verifySession(): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('fm_session')?.value;

    if (!sessionToken) {
      return { authenticated: false };
    }

    const result = await getSessionUser(sessionToken);

    if (!result || !result.subscription) {
      return { authenticated: false };
    }

    return { authenticated: true, userId: result.user.id };
  } catch (error) {
    console.error('Session verification error:', error);
    return { authenticated: false };
  }
}
