import { NextRequest, NextResponse } from 'next/server';
import { verifyHubToken } from '@/lib/hub/jwt';
import { getOrCreateUser, getActiveSubscription, checkNonceUsed, markNonceUsed, createSession } from '@/lib/supabase/db';
import { cookies } from 'next/headers';

const HUB_URL = process.env.HUB_URL || 'https://hub.com';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${HUB_URL}/error?reason=missing_token`);
  }

  try {
    const payload = await verifyHubToken(token);

    const nonceUsed = await checkNonceUsed(payload.nonce);
    if (nonceUsed) {
      return NextResponse.redirect(`${HUB_URL}/error?reason=token_already_used`);
    }

    await markNonceUsed(payload.nonce);

    const user = await getOrCreateUser(payload.sub, payload.email, payload.name);

    const subscription = await getActiveSubscription(user.id);
    if (!subscription) {
      return NextResponse.redirect(`${HUB_URL}/products/festa-magica?reason=no_subscription`);
    }

    const sessionToken = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('fm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.redirect(new URL('/criar', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${HUB_URL}/error?reason=invalid_token`);
  }
}
