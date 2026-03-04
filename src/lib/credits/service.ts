import { createServiceRoleClient } from '@/lib/supabase/server';
import { CREDITS_STARTER_BALANCE } from '@/lib/config';

interface ReserveCreditsInput {
  userId: string;
  kitItemType: string;
  cost: number;
  idempotencyKey: string;
}

export interface GrantCreditsInput {
  userId: string;
  amount: number;
  reason: 'purchase' | 'manual_grant' | 'adjustment';
  referenceType: 'webhook_event' | 'admin';
  referenceId: string;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
}

export interface GrantCreditsResult {
  newBalance: number;
  ledgerId: string;
}

export interface SetCreditsBalanceInput {
  userId: string;
  targetBalance: number;
  referenceId: string;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
}

export interface SetCreditsBalanceResult {
  previousBalance: number;
  newBalance: number;
  delta: number;
  ledgerId: string | null;
}

export interface ReserveCreditsResult {
  attemptId: string;
  newBalance: number;
  alreadyProcessed: boolean;
}

export interface CreditLedgerEntry {
  id: string;
  direction: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceType: string;
  referenceId: string | null;
  createdAt: string;
  meta: Record<string, unknown>;
}

function parseKnownCreditsError(error: unknown): 'insufficient_credits' | 'invalid_idempotency' | 'unknown' {
  const message = String((error as { message?: string })?.message || '').toLowerCase();

  if (message.includes('insufficient_credits')) return 'insufficient_credits';
  if (message.includes('missing_idempotency_key')) return 'invalid_idempotency';
  return 'unknown';
}

function assertGrantInput(input: GrantCreditsInput): void {
  if (!input.userId?.trim()) {
    throw new Error('invalid_user');
  }

  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error('invalid_amount');
  }

  if (!input.referenceId?.trim()) {
    throw new Error('invalid_reference');
  }

  if (!input.idempotencyKey?.trim()) {
    throw new Error('invalid_idempotency');
  }
}

function assertSetBalanceInput(input: SetCreditsBalanceInput): void {
  if (!input.userId?.trim()) {
    throw new Error('invalid_user');
  }

  if (!Number.isInteger(input.targetBalance) || input.targetBalance < 0) {
    throw new Error('invalid_target_balance');
  }

  if (!input.referenceId?.trim()) {
    throw new Error('invalid_reference');
  }

  if (!input.idempotencyKey?.trim()) {
    throw new Error('invalid_idempotency');
  }
}

export async function getCreditsBalance(userId: string): Promise<number> {
  const supabase = createServiceRoleClient();

  const { error: ensureError } = await supabase
    .from('user_credit_wallets')
    .insert({
      user_id: userId,
      balance: CREDITS_STARTER_BALANCE,
    })
    .select('user_id')
    .maybeSingle();

  if (ensureError && ensureError.code !== '23505') {
    throw new Error(`Failed to initialize credits wallet: ${ensureError.message}`);
  }

  const { data, error } = await supabase
    .from('user_credit_wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch credits balance: ${error.message}`);
  }

  return Number(data?.balance || 0);
}

export async function getCreditsLedger(userId: string, limit = 50): Promise<CreditLedgerEntry[]> {
  const supabase = createServiceRoleClient();

  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

  const { data, error } = await supabase
    .from('credit_ledger')
    .select('id, direction, amount, reason, reference_type, reference_id, created_at, meta')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Failed to fetch credit ledger: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: String(row.id),
    direction: row.direction as 'credit' | 'debit',
    amount: Number(row.amount || 0),
    reason: String(row.reason || ''),
    referenceType: String(row.reference_type || ''),
    referenceId: row.reference_id ? String(row.reference_id) : null,
    createdAt: String(row.created_at || ''),
    meta: (row.meta as Record<string, unknown>) || {},
  }));
}

export async function reserveCreditsForGeneration(input: ReserveCreditsInput): Promise<ReserveCreditsResult> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc('reserve_generation_credit', {
    p_user_id: input.userId,
    p_kit_item_type: input.kitItemType,
    p_credit_cost: input.cost,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) {
    const known = parseKnownCreditsError(error);
    if (known === 'insufficient_credits') {
      throw new Error('insufficient_credits');
    }

    if (known === 'invalid_idempotency') {
      throw new Error('invalid_idempotency');
    }

    throw new Error(`Failed to reserve credits: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.attempt_id) {
    throw new Error('Failed to reserve credits: missing attempt id');
  }

  return {
    attemptId: String(row.attempt_id),
    newBalance: Number(row.new_balance || 0),
    alreadyProcessed: !!row.already_processed,
  };
}

export async function markGenerationSucceeded(attemptId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase.rpc('complete_generation_attempt', {
    p_attempt_id: attemptId,
  });

  if (error) {
    throw new Error(`Failed to mark generation succeeded: ${error.message}`);
  }
}

export async function markGenerationFailedAndRefund(
  attemptId: string,
  errorCode: string,
  idempotencyKey?: string
): Promise<number> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc('refund_generation_attempt', {
    p_attempt_id: attemptId,
    p_error_code: errorCode,
    p_idempotency_key: idempotencyKey || `refund:${attemptId}`,
  });

  if (error) {
    throw new Error(`Failed to refund credits: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return Number(row?.new_balance || 0);
}

export async function grantCredits(input: GrantCreditsInput): Promise<GrantCreditsResult> {
  assertGrantInput(input);

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc('grant_credits', {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_reason: input.reason,
    p_reference_type: input.referenceType,
    p_reference_id: input.referenceId,
    p_idempotency_key: input.idempotencyKey,
    p_meta: input.meta || {},
  });

  if (error) {
    throw new Error(`Failed to grant credits: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.ledger_id) {
    throw new Error('Failed to grant credits: missing ledger id');
  }

  return {
    newBalance: Number(row.new_balance || 0),
    ledgerId: String(row.ledger_id),
  };
}

export async function setCreditsBalance(input: SetCreditsBalanceInput): Promise<SetCreditsBalanceResult> {
  assertSetBalanceInput(input);
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc('set_wallet_balance_admin', {
    p_user_id: input.userId,
    p_target_balance: input.targetBalance,
    p_reference_id: input.referenceId,
    p_idempotency_key: input.idempotencyKey,
    p_meta: input.meta || {},
  });

  if (error) {
    const normalizedMessage = String(error.message || '').toLowerCase();
    if (normalizedMessage.includes('invalid_target_balance')) {
      throw new Error('invalid_target_balance');
    }
    if (normalizedMessage.includes('invalid_idempotency')) {
      throw new Error('invalid_idempotency');
    }

    throw new Error(`Failed to set credits balance: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    previousBalance: Number(row?.previous_balance || 0),
    newBalance: Number(row?.new_balance || 0),
    delta: Number(row?.delta || 0),
    ledgerId: row?.ledger_id ? String(row.ledger_id) : null,
  };
}
