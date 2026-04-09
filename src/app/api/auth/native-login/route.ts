import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureHubUserForAuthUser, getActiveUserProduct } from '@/lib/supabase/db';
import { setSessionCookie } from '@/lib/auth/helpers';
import { CREDITS_FEATURE_ENABLED } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'Token ausente' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const hubUser = await ensureHubUserForAuthUser(data.user);

    const subscription = await getActiveUserProduct(hubUser.id);
    if (!subscription && !CREDITS_FEATURE_ENABLED) {
      return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 403 });
    }

    await setSessionCookie(hubUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Native login error:', error);
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}
