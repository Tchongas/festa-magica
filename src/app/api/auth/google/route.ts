import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase/server';
import { PRODUCT_ID } from '@/lib/config';

const HUB_FESTA_LOGIN_URL = process.env.HUB_FESTA_LOGIN_URL;

function safeRedirectPath(raw?: string | null): string | null {
  return raw?.startsWith('/') ? raw : null;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const redirectTo = safeRedirectPath(request.nextUrl.searchParams.get('redirect_to'));

    if (redirectTo) {
      const cookieStore = await cookies();
      cookieStore.set('auth_redirect_to', redirectTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10,
        path: '/',
      });
    }

    if (HUB_FESTA_LOGIN_URL) {
      try {
        const hubAuthUrl = new URL(HUB_FESTA_LOGIN_URL);
        hubAuthUrl.searchParams.set('product', PRODUCT_ID);
        hubAuthUrl.searchParams.set('return_to', `${origin}/api/auth/callback`);
        if (redirectTo) hubAuthUrl.searchParams.set('redirect_to', redirectTo);

        return NextResponse.redirect(hubAuthUrl.toString());
      } catch (error) {
        console.error('Invalid HUB_FESTA_LOGIN_URL, falling back to direct OAuth:', error);
      }
    }

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/api/auth/callback` },
    });

    if (error || !data.url) {
      return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error('Error in /api/auth/google:', error);
    return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
  }
}
