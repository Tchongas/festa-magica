import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateHubUserForAuthUser,
  getActiveUserProduct,
  hasFestaMagicaProductByEmail,
} from '@/lib/supabase/db';
import { createAnonClient } from '@/lib/supabase/anon-client';
import { setSessionCookie, safeRedirectPath } from '@/lib/auth/helpers';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';
import { logStartTrialCheckpoint, sendStartTrialEvent } from '@/lib/analytics/meta';

const ALREADY_EXISTS_MSG =
  'Este email já está em uso. Se sua conta foi criada com Google, clique em "Continuar com Google".';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, redirect_to } = await request.json();
    logStartTrialCheckpoint('auth_register_request_received', {
      hasEmail: !!email,
      hasName: !!name,
      hasRedirectTo: !!redirect_to,
    });

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name || '').trim();

    const hasAccess = await hasFestaMagicaProductByEmail(normalizedEmail);
    logStartTrialCheckpoint('auth_register_access_check', { normalizedEmail, hasAccess });
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Não encontramos o produto Festa Mágica para este email. Use o email da compra ou fale com o suporte.' },
        { status: 403 }
      );
    }

    const supabase = createAnonClient();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(password),
      options: {
        data: {
          name: normalizedName || undefined,
          full_name: normalizedName || undefined,
        },
      },
    });

    if (error) {
      logStartTrialCheckpoint('auth_register_supabase_signup_error', {
        normalizedEmail,
        message: error.message,
      });
      if (error.message.toLowerCase().includes('already')) {
        return NextResponse.json({ error: ALREADY_EXISTS_MSG }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || 'Erro ao criar conta' }, { status: 400 });
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      logStartTrialCheckpoint('auth_register_existing_user_identity_empty', { normalizedEmail });
      return NextResponse.json({ error: ALREADY_EXISTS_MSG }, { status: 409 });
    }

    if (data.user) {
      const { user: hubUser, isNewUser } = await getOrCreateHubUserForAuthUser(data.user);
      logStartTrialCheckpoint('auth_register_hub_user_resolved', {
        authUserId: data.user.id,
        hubUserId: hubUser.id,
        isNewUser,
      });

      if (isNewUser) {
        void sendStartTrialEvent({
          userId: hubUser.id,
          email: hubUser.email,
          source: 'auth_register',
          eventId: `account-created:${hubUser.id}`,
        });
      }

      if (data.session) {
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
      }
    }

    return NextResponse.json({
      success: true,
      requires_email_confirmation: true,
      message: 'Conta criada. Verifique seu email para confirmar o cadastro antes de entrar.',
    });
  } catch (error) {
    console.error('Email register error:', error);
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
}
