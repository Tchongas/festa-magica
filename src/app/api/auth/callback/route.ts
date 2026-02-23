import { NextRequest, NextResponse } from 'next/server';
import { verifyHubToken } from '@/lib/hub/jwt';
import {
  getUserById,
  getActiveUserProduct,
  checkNonceUsed,
  markNonceUsed,
  createSession,
  ensureHubUserForAuthUser,
  hasFestaMagicaProductByEmail,
} from '@/lib/supabase/db';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase/server';

const MEMBROS_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get('code');
  const token = request.nextUrl.searchParams.get('token');

  if (token) {
    try {
      const payload = await verifyHubToken(token);

      const nonceUsed = await checkNonceUsed(payload.nonce);
      if (nonceUsed) {
        return NextResponse.redirect(`${MEMBROS_URL}?error=no_access`);
      }

      await markNonceUsed(payload.nonce);

      const user = await getUserById(payload.sub);
      if (!user) {
        return NextResponse.redirect(`${MEMBROS_URL}?error=no_access`);
      }

      const subscription = await getActiveUserProduct(user.id);
      if (!subscription) {
        return NextResponse.redirect(`${MEMBROS_URL}?error=no_access`);
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
      return NextResponse.redirect(`${MEMBROS_URL}?error=no_access`);
    }
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=auth_failed`);
  }

  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
    }

    const authUser = data.user;
    const normalizedEmail = String(authUser.email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
    }

    const hasProduct = await hasFestaMagicaProductByEmail(normalizedEmail);
    if (!hasProduct) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/entrar?error=no_product`);
    }

    const hubUser = await ensureHubUserForAuthUser(authUser);
    const subscription = await getActiveUserProduct(hubUser.id);
    if (!subscription) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/entrar?error=no_active_access`);
    }

    const sessionToken = await createSession(hubUser.id);

    const cookieStore = await cookies();
    cookieStore.set('fm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    const redirectTo = cookieStore.get('auth_redirect_to')?.value;
    if (redirectTo) {
      cookieStore.delete('auth_redirect_to');
      if (redirectTo.startsWith('/')) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }

    return NextResponse.redirect(`${origin}/criar`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
  }
}
