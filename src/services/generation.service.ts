import { KitItemType } from '@/types';

const API_BASE = '/api/generate';

export class APIError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function postJSON<T>(
  endpoint: string,
  body: unknown,
  errorMsg: string,
  headers: Record<string, string> = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new APIError(
      data?.error || errorMsg,
      response.status,
      data?.code,
      data?.details
    );
  }

  return response.json();
}

export async function fetchCreditsBalance(): Promise<{ enabled: boolean; balance: number | null; requiredForGeneration: boolean }> {
  const response = await fetch('/api/credits/balance', { method: 'GET' });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new APIError(
      data?.error || 'Erro ao carregar créditos',
      response.status,
      data?.code,
      data?.details
    );
  }

  const data = await response.json();
  return {
    enabled: !!data.enabled,
    balance: typeof data.balance === 'number' ? data.balance : null,
    requiredForGeneration: !!data.requiredForGeneration,
  };
}

export interface CreditsLedgerEntry {
  id: string;
  direction: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceType: string;
  referenceId: string | null;
  createdAt: string;
  meta: Record<string, unknown>;
}

export async function fetchCreditsLedger(limit = 50): Promise<CreditsLedgerEntry[]> {
  const response = await fetch(`/api/credits/ledger?limit=${Math.min(Math.max(limit, 1), 200)}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new APIError(
      data?.error || 'Erro ao carregar histórico de créditos',
      response.status,
      data?.code,
      data?.details
    );
  }

  const data = await response.json();
  return Array.isArray(data.entries) ? data.entries : [];
}

export interface CreditsAdminSessionInfo {
  authorized: boolean;
  adminUserId?: string;
  adminEmail?: string;
}

export async function fetchCreditsAdminSession(): Promise<CreditsAdminSessionInfo> {
  const response = await fetch('/api/credits/grant', { method: 'GET' });

  if (response.status === 401) {
    return { authorized: false };
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new APIError(
      data?.error || 'Erro ao validar sessão de admin',
      response.status,
      data?.code,
      data?.details
    );
  }

  const data = await response.json();
  return {
    authorized: !!data.authorized,
    adminUserId: data.adminUserId,
    adminEmail: data.adminEmail,
  };
}

export interface AdminGrantInput {
  userId?: string;
  email?: string;
  amount: number;
  reason: 'manual_grant' | 'adjustment';
  referenceId: string;
  idempotencyKey?: string;
  meta?: Record<string, unknown>;
}

export interface AdminGrantResult {
  success: boolean;
  userId: string;
  ledgerId: string;
  newBalance: number;
}

export async function submitAdminCreditsGrant(input: AdminGrantInput): Promise<AdminGrantResult> {
  const response = await fetch('/api/credits/grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new APIError(
      data?.error || 'Erro ao conceder créditos',
      response.status,
      data?.code,
      data?.details
    );
  }

  return response.json();
}

export async function describeChild(photoBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  const data = await postJSON<{ description: string }>(
    'describe-child',
    { photoBase64, mimeType },
    'Erro ao analisar foto da criança'
  );
  return data.description;
}

export async function describeTheme(themeBase64: string | null, mimeType = 'image/jpeg'): Promise<string> {
  const data = await postJSON<{ description: string }>(
    'describe-theme',
    { themeBase64, mimeType },
    'Erro ao analisar tema'
  );
  return data.description;
}

export async function generateKitImage(
  type: KitItemType,
  childDescription: string,
  themeDescription: string,
  childPhotoBase64: string,
  childPhotoMimeType: string,
  age: string,
  features: string,
  tone: string,
  style: string,
  idempotencyKey: string
): Promise<{ imageUrl: string; creditsBalance: number | null; creditsCharged: boolean }> {
  const data = await postJSON<{ imageUrl: string; credits?: { balance: number | null; charged: boolean } }>(
    'kit-image',
    { type, childDescription, themeDescription, childPhotoBase64, childPhotoMimeType, age, features, tone, style },
    `Erro ao gerar ${type}`,
    { 'x-idempotency-key': idempotencyKey }
  );

  return {
    imageUrl: data.imageUrl,
    creditsBalance: typeof data.credits?.balance === 'number' ? data.credits.balance : null,
    creditsCharged: !!data.credits?.charged,
  };
}
