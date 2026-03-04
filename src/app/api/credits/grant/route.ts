import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, getUserById } from '@/lib/supabase/db';
import { getCreditsBalance, getCreditsLedger, setCreditsBalance } from '@/lib/credits/service';
import { verifySession } from '@/lib/auth/verify-session';
import { CREDITS_ADMIN_EMAILS } from '@/lib/config';
import { createServiceRoleClient } from '@/lib/supabase/server';

const updateWalletSchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    targetBalance: z.number().int().nonnegative().max(1_000_000),
    description: z.string().trim().min(3).max(300),
    referenceId: z.string().trim().min(1).max(120).optional(),
    idempotencyKey: z.string().trim().min(1).max(200).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => !!value.userId || !!value.email, {
    message: 'Informe userId ou email',
    path: ['userId'],
  });

function normalizeEmail(email?: string): string {
  return String(email || '').trim().toLowerCase();
}

type AdminFailureReason = 'unauthenticated' | 'not_allowlisted' | 'not_google_auth';

async function isGoogleAuthUser(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return false;
  }

  const providersFromMetadata = Array.isArray(data.user.app_metadata?.providers)
    ? data.user.app_metadata.providers
    : [];
  const providersFromIdentities = Array.isArray(data.user.identities)
    ? data.user.identities.map((identity) => identity.provider)
    : [];

  const providers = [...providersFromMetadata, ...providersFromIdentities]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);

  return providers.includes('google');
}

async function assertAdminSession(): Promise<
  { ok: true; adminUserId: string; adminEmail: string } | { ok: false; reason: AdminFailureReason }
> {
  const { authenticated, userId } = await verifySession({ requireSubscription: false });
  if (!authenticated || !userId) return { ok: false, reason: 'unauthenticated' };

  const adminUser = await getUserById(userId);
  const adminEmail = normalizeEmail(adminUser?.email);
  if (!adminEmail || !CREDITS_ADMIN_EMAILS.includes(adminEmail)) {
    return { ok: false, reason: 'not_allowlisted' };
  }

  const hasGoogleAuth = await isGoogleAuthUser(userId);
  if (!hasGoogleAuth) {
    return { ok: false, reason: 'not_google_auth' };
  }

  return { ok: true, adminUserId: userId, adminEmail };
}

export async function GET(request: NextRequest) {
  const admin = await assertAdminSession();

  if (!admin.ok) {
    return NextResponse.json({ authorized: false, reason: admin.reason }, { status: 401 });
  }

  const emailQuery = normalizeEmail(request.nextUrl.searchParams.get('email') || '');
  if (!emailQuery) {
    return NextResponse.json({
      authorized: true,
      adminUserId: admin.adminUserId,
      adminEmail: admin.adminEmail,
    });
  }

  const user = await getUserByEmail(emailQuery);
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const balance = await getCreditsBalance(user.id);
  const history = await getCreditsLedger(user.id, 30);

  return NextResponse.json({
    authorized: true,
    adminUserId: admin.adminUserId,
    adminEmail: admin.adminEmail,
    wallet: {
      userId: user.id,
      email: user.email,
      name: user.name,
      balance,
      history,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await assertAdminSession();
    if (!admin.ok) {
      const errorMessage =
        admin.reason === 'not_google_auth'
          ? 'Acesso restrito a admins com login Google.'
          : 'Não autorizado';
      return NextResponse.json({ error: errorMessage, reason: admin.reason }, { status: 401 });
    }

    const parsed = updateWalletSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload inválido', details: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const email = normalizeEmail(input.email);

    const user = input.userId ? await getUserById(input.userId) : await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const referenceId = input.referenceId || `wallet-edit:${user.id}:${Date.now()}`;
    const idempotencyKey = input.idempotencyKey || `admin:${admin.adminUserId}:${referenceId}`;

    const result = await setCreditsBalance({
      userId: user.id,
      targetBalance: input.targetBalance,
      referenceId,
      idempotencyKey,
      meta: {
        ...(input.meta || {}),
        source: 'admin_panel',
        description: input.description,
        granted_by_user_id: admin.adminUserId,
        granted_by_email: admin.adminEmail,
        edited_user_id: user.id,
        edited_user_email: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      ledgerId: result.ledgerId,
      previousBalance: result.previousBalance,
      newBalance: result.newBalance,
      delta: result.delta,
    });
  } catch (error) {
    console.error('Credits grant error:', error);
    if ((error as Error).message === 'insufficient_credits') {
      return NextResponse.json({ error: 'Saldo insuficiente para reduzir para este valor.' }, { status: 400 });
    }
    if ((error as Error).message === 'invalid_target_balance') {
      return NextResponse.json({ error: 'Saldo de destino inválido.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar carteira de créditos' }, { status: 500 });
  }
}
