import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, getUserById } from '@/lib/supabase/db';
import { grantCredits } from '@/lib/credits/service';
import { verifySession } from '@/lib/auth/verify-session';
import { CREDITS_ADMIN_EMAILS } from '@/lib/config';

const grantSchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    amount: z.number().int().positive().max(100_000),
    reason: z.enum(['manual_grant', 'adjustment']).default('manual_grant'),
    referenceId: z.string().trim().min(1).max(120),
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

async function assertAdminSession(): Promise<{ ok: true; adminUserId: string; adminEmail: string } | { ok: false }> {
  const { authenticated, userId } = await verifySession({ requireSubscription: false });
  if (!authenticated || !userId) return { ok: false };

  const adminUser = await getUserById(userId);
  const adminEmail = normalizeEmail(adminUser?.email);
  if (!adminEmail || !CREDITS_ADMIN_EMAILS.includes(adminEmail)) {
    return { ok: false };
  }

  return { ok: true, adminUserId: userId, adminEmail };
}

export async function GET() {
  const admin = await assertAdminSession();

  if (!admin.ok) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  return NextResponse.json({
    authorized: true,
    adminUserId: admin.adminUserId,
    adminEmail: admin.adminEmail,
  });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await assertAdminSession();
    if (!admin.ok) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const parsed = grantSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload inválido', details: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const email = normalizeEmail(input.email);

    const user = input.userId ? await getUserById(input.userId) : await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const idempotencyKey = input.idempotencyKey || `admin:${admin.adminUserId}:${input.referenceId}:${Date.now()}`;

    const result = await grantCredits({
      userId: user.id,
      amount: input.amount,
      reason: input.reason,
      referenceType: 'admin',
      referenceId: input.referenceId,
      idempotencyKey,
      meta: {
        ...(input.meta || {}),
        source: 'admin_panel',
        granted_by_user_id: admin.adminUserId,
        granted_by_email: admin.adminEmail,
        granted_to_email: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      ledgerId: result.ledgerId,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error('Credits grant error:', error);
    return NextResponse.json({ error: 'Erro ao conceder créditos' }, { status: 500 });
  }
}
