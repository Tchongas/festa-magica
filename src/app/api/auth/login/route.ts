import { NextRequest, NextResponse } from 'next/server';
import { ensureHubUserForAuthUser, getActiveUserProduct } from '@/lib/supabase/db';
import { createAnonClient } from '@/lib/supabase/anon-client';
import { setSessionCookie, safeRedirectPath } from '@/lib/auth/helpers';

const LOGIN_ERROR_MAP: Record<string, string> = {
  'email not confirmed': 'Confirme seu email antes de entrar.',
  'invalid login credentials': 'Email ou senha inválidos. Se sua conta foi criada com Google, clique em "Continuar com Google".',
};

function mapLoginError(message?: string): string {
  const normalized = (message || '').toLowerCase();
  for (const [key, value] of Object.entries(LOGIN_ERROR_MAP)) {
    if (normalized.includes(key)) return value;
  }
  return 'Email ou senha inválidos';
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect_to } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const supabase = createAnonClient();

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

    await setSessionCookie(hubUser.id);

    return NextResponse.json({
      success: true,
      redirect_to: safeRedirectPath(redirect_to),
    });
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
