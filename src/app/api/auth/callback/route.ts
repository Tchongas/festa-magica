import { NextRequest, NextResponse } from 'next/server';
import { verifyHubToken } from '@/lib/hub/jwt';
import {
  getUserById,
  getUserByEmail,
  getActiveUserProduct,
  checkNonceUsed,
  markNonceUsed,
  getOrCreateHubUserForAuthUser,
  hasFestaMagicaProductByEmail,
} from '@/lib/supabase/db';
import { createSupabaseServer } from '@/lib/supabase/server';
import { setSessionCookie, resolveRedirectUrl, withStartTrialFlagUrl } from '@/lib/auth/helpers';
import { MEMBROS_URL } from '@/lib/config';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get('code');
  const token = request.nextUrl.searchParams.get('token');

  if (token) {
    return handleTokenCallback(token, origin);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=auth_failed`);
  }

  return handleOAuthCallback(code, origin);
}

async function handleTokenCallback(token: string, origin: string) {
  try {
    const payload = await verifyHubToken(token);

    if (await checkNonceUsed(payload.nonce)) {
      console.error('Token callback: nonce already used', payload.nonce);
      return NextResponse.redirect(`${MEMBROS_URL}?error=nonce_used`);
    }
    await markNonceUsed(payload.nonce);

    const user = (await getUserById(payload.sub)) || (await getUserByEmail(payload.email));
    if (!user) {
      console.error('Token callback: user not found', { sub: payload.sub, email: payload.email });
      return NextResponse.redirect(`${MEMBROS_URL}?error=user_not_found`);
    }

    const subscription = await getActiveUserProduct(user.id);
    if (!subscription && !CREDITS_FEATURE_ENABLED) {
      console.error('Token callback: no active subscription for user', { userId: user.id, email: user.email });
      return NextResponse.redirect(`${MEMBROS_URL}?error=no_active_access`);
    }

    await setSessionCookie(user.id);
    const redirectUrl = await resolveRedirectUrl(origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Token callback error:', error);
    return NextResponse.redirect(`${MEMBROS_URL}?error=token_invalid`);
  }
}

async function handleOAuthCallback(code: string, origin: string) {
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

    const { user: hubUser, isNewUser } = await getOrCreateHubUserForAuthUser(authUser);
    const subscription = await getActiveUserProduct(hubUser.id);
    if (!subscription && !CREDITS_FEATURE_ENABLED) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/entrar?error=no_active_access`);
    }

    await setSessionCookie(hubUser.id);
    const redirectUrl = await resolveRedirectUrl(origin);
    return NextResponse.redirect(isNewUser ? withStartTrialFlagUrl(redirectUrl) : redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
  }
}
