import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  createSession,
  ensureHubUserForAuthUser,
  getActiveUserProduct,
  hasFestaMagicaProductByEmail,
} from '@/lib/supabase/db';

const DEFAULT_REDIRECT_PATH = '/criar';

function safeRedirectPath(redirectTo?: string): string {
  if (!redirectTo) return DEFAULT_REDIRECT_PATH;
  return redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT_PATH;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, redirect_to } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name || '').trim();

    const hasAccess = await hasFestaMagicaProductByEmail(normalizedEmail);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Não encontramos o produto Festa Mágica para este email. Use o email da compra ou fale com o suporte.',
        },
        { status: 403 }
      );
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
      if (error.message.toLowerCase().includes('already')) {
        return NextResponse.json(
          {
            error:
              'Este email já está em uso. Se sua conta foi criada com Google, clique em "Continuar com Google".',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message || 'Erro ao criar conta' }, { status: 400 });
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return NextResponse.json(
        {
          error:
            'Este email já está em uso. Se sua conta foi criada com Google, clique em "Continuar com Google".',
        },
        { status: 409 }
      );
    }

    if (data.user) {
      const hubUser = await ensureHubUserForAuthUser(data.user);

      if (data.session) {
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
