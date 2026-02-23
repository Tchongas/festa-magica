import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const origin = request.nextUrl.origin;

  const redirectTo = request.nextUrl.searchParams.get('redirect_to');
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/entrar?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
