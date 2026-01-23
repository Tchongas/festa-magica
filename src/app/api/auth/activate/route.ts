import { NextRequest, NextResponse } from 'next/server';
import { validateActivationCodeFormat } from '@/lib/hub/activation';
import { validateActivationCode, activateSubscription, createSession, getUserByHubId } from '@/lib/supabase/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { code, hubUserId, email, name } = await request.json();

    if (!code || !hubUserId || !email) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (!validateActivationCodeFormat(code)) {
      return NextResponse.json(
        { error: 'Formato de código inválido' },
        { status: 400 }
      );
    }

    const isCodeAvailable = await validateActivationCode(code);
    if (!isCodeAvailable) {
      return NextResponse.json(
        { error: 'Código já foi utilizado' },
        { status: 400 }
      );
    }

    let user = await getUserByHubId(hubUserId);
    if (!user) {
      const { getOrCreateUser } = await import('@/lib/supabase/db');
      user = await getOrCreateUser(hubUserId, email, name);
    }

    const subscription = await activateSubscription(user.id, code, 3);

    const sessionToken = await createSession(user.id);

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
      subscription: {
        expires_at: subscription.expires_at,
      },
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Erro ao ativar código' },
      { status: 500 }
    );
  }
}
