export const PRODUCT_ID = 'festa-magica';

export const SESSION_COOKIE_NAME = 'fm_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const DEFAULT_REDIRECT = '/criar';

export const MEMBROS_URL =
  process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: '/',
};
