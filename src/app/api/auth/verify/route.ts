import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/db';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/config';

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    const result = await getSessionUser(sessionToken);

    if (!result) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: result.user,
      subscription: result.subscription,
      hasActiveSubscription: !!result.subscription,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
