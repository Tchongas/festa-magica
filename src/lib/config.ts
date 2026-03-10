export const PRODUCT_ID = 'festa-magica';

export const SESSION_COOKIE_NAME = 'fm_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const DEFAULT_REDIRECT = '/criar';

export const MEMBROS_URL =
  process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export const HOTMART_40_CREDITS_URL = 'https://pay.hotmart.com/I104822104V';
export const HOTMART_200_CREDITS_URL = 'https://pay.hotmart.com/T104822199S';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: '/',
};

export type CreditsMode = 'off' | 'hybrid' | 'credits_only';

function envFlag(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function envNonNegativeNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function envCreditsMode(value: string | undefined): CreditsMode {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'hybrid' || normalized === 'credits_only') return normalized;
  return 'credits_only';
}

export const CREDITS_MODE: CreditsMode = envCreditsMode(process.env.CREDITS_MODE);
export const CREDITS_FEATURE_ENABLED = CREDITS_MODE !== 'off';
export const CREDITS_CHARGE_SUBSCRIBERS = envFlag(process.env.CREDITS_CHARGE_SUBSCRIBERS, false);
export const CREDITS_COST_PER_IMAGE = envNumber(process.env.CREDITS_COST_PER_IMAGE, 1);
export const CREDITS_STARTER_BALANCE = envNonNegativeNumber(process.env.CREDITS_STARTER_BALANCE, 5);

export const CREDITS_ADMIN_EMAILS = String(process.env.CREDITS_ADMIN_EMAILS || '')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
