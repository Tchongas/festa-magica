import { NextRequest, NextResponse } from 'next/server';
import { verifyHubToken } from '@/lib/hub/jwt';
import { getUserById, getActiveUserProduct, checkNonceUsed, markNonceUsed, createSession } from '@/lib/supabase/db';
import { cookies } from 'next/headers';

const HUB_URL = process.env.HUB_URL || 'https://allanhub.vercel.app/';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${HUB_URL}/?error=no_access&product=festa-magica`);
  }

  try {
    const payload = await verifyHubToken(token);

    const nonceUsed = await checkNonceUsed(payload.nonce);
    if (nonceUsed) {
      return NextResponse.redirect(`${HUB_URL}/?error=no_access&product=festa-magica`);
    }

    await markNonceUsed(payload.nonce);

    const user = await getUserById(payload.sub);
    if (!user) {
      return NextResponse.redirect(`${HUB_URL}/?error=no_access&product=festa-magica`);
    }

    const subscription = await getActiveUserProduct(user.id);
    if (!subscription) {
      return NextResponse.redirect(`${HUB_URL}/?error=no_access&product=festa-magica`);
    }

    const sessionToken = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('fm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.redirect(new URL('/criar', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${HUB_URL}/?error=no_access&product=festa-magica`);
  }
}
