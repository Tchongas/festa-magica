import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createSession, ensureHubUserForAuthUser, getActiveUserProduct } from '@/lib/supabase/db';

function safeRedirectPath(redirectTo?: string): string {
  if (!redirectTo) return '/criar';
  return redirectTo.startsWith('/') ? redirectTo : '/criar';
}

function mapLoginError(message?: string): string {
  const normalized = (message || '').toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'Confirme seu email antes de entrar.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha inválidos. Se sua conta foi criada com Google, clique em "Continuar com Google".';
  }

  return 'Email ou senha inválidos';
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect_to } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: mapLoginError(error?.message) }, { status: 401 });
    }

    const hubUser = await ensureHubUserForAuthUser(data.user);
    const subscription = await getActiveUserProduct(hubUser.id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Sua conta não possui acesso ativo ao Festa Mágica.' },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      redirect_to: safeRedirectPath(redirect_to),
    });
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
