import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateHubUserForAuthUser, getActiveUserProduct } from '@/lib/supabase/db';
import { createAnonClient } from '@/lib/supabase/anon-client';
import { setSessionCookie, safeRedirectPath } from '@/lib/auth/helpers';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';
import { logStartTrialCheckpoint, sendStartTrialEvent } from '@/lib/analytics/meta';

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
    logStartTrialCheckpoint('auth_login_request_received', {
      hasEmail: !!email,
      hasRedirectTo: !!redirect_to,
    });

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const supabase = createAnonClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (error || !data.user || !data.session) {
      logStartTrialCheckpoint('auth_login_failed', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        message: error?.message || null,
      });
      return NextResponse.json({ error: mapLoginError(error?.message) }, { status: 401 });
    }

    const { user: hubUser, isNewUser } = await getOrCreateHubUserForAuthUser(data.user);
    logStartTrialCheckpoint('auth_login_hub_user_resolved', {
      authUserId: data.user.id,
      hubUserId: hubUser.id,
      isNewUser,
    });

    if (isNewUser) {
      void sendStartTrialEvent({
        userId: hubUser.id,
        email: hubUser.email,
        source: 'auth_login',
        eventId: `account-created:${hubUser.id}`,
      });
    }

    const subscription = await getActiveUserProduct(hubUser.id);

    if (!subscription && !CREDITS_FEATURE_ENABLED) {
      return NextResponse.json(
        { error: 'Sua conta não possui acesso ativo ao Festa Mágica.' },
        { status: 403 }
      );
    }

    await setSessionCookie(hubUser.id);
    const redirectPath = safeRedirectPath(redirect_to);

    return NextResponse.json({
      success: true,
      redirect_to: redirectPath,
    });
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
