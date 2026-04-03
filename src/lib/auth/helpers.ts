import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  DEFAULT_REDIRECT,
} from '@/lib/config';
import { createSession } from '@/lib/supabase/db';

export function safeRedirectPath(redirectTo?: string | null): string {
  if (!redirectTo) return DEFAULT_REDIRECT;
  return redirectTo.startsWith('/') ? redirectTo : DEFAULT_REDIRECT;
}

export function withStartTrialFlagPath(redirectPath: string): string {
  const [pathname, query = ''] = redirectPath.split('?');
  const params = new URLSearchParams(query);
  params.set('start_trial', '1');
  const serialized = params.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function withStartTrialFlagUrl(redirectUrl: string): string {
  const parsed = new URL(redirectUrl);
  parsed.searchParams.set('start_trial', '1');
  return parsed.toString();
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

export async function resolveRedirectUrl(origin: string): Promise<string> {
  const cookieStore = await cookies();
  const saved = cookieStore.get('auth_redirect_to')?.value;

  if (saved) {
    cookieStore.delete('auth_redirect_to');
    if (saved.startsWith('/')) {
      return `${origin}${saved}`;
    }
  }

  return `${origin}${DEFAULT_REDIRECT}`;
}

export async function clearSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  cookieStore.delete(SESSION_COOKIE_NAME);
  return token;
}
