import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('fm_session')?.value;

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
