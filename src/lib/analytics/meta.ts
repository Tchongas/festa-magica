import { createHash } from 'crypto';

type StartTrialSource =
  | 'auth_register'
  | 'auth_oauth_callback'
  | 'auth_login'
  | 'auth_native_login'
  | 'wallet_init';

interface StartTrialEventInput {
  userId: string;
  email?: string | null;
  source: StartTrialSource;
  eventId?: string;
}

const META_PIXEL_ID = String(process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
const META_ACCESS_TOKEN = String(process.env.META_ACCESS_TOKEN || process.env.META_PIXEL_ACCESS_TOKEN || '').trim();
const META_TEST_EVENT_CODE = String(process.env.META_TEST_EVENT_CODE || '').trim();

function hashEmail(email?: string | null): string | undefined {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

function log(tag: string, payload: Record<string, unknown>): void {
  console.log(`[meta:starttrial:${tag}]`, JSON.stringify(payload));
}

export function logStartTrialCheckpoint(tag: string, payload: Record<string, unknown>): void {
  log(`checkpoint:${tag}`, payload);
}

export async function sendStartTrialEvent(input: StartTrialEventInput): Promise<void> {
  const envReady = !!META_PIXEL_ID && !!META_ACCESS_TOKEN;

  log('prepare', {
    source: input.source,
    userId: input.userId,
    hasEmail: !!String(input.email || '').trim(),
    envReady,
    pixelIdLength: META_PIXEL_ID.length,
    accessTokenLength: META_ACCESS_TOKEN.length,
  });

  if (!envReady) {
    console.error('[meta:starttrial:skip]', 'Missing META_PIXEL_ID or META_ACCESS_TOKEN');
    return;
  }

  const eventId = input.eventId || `starttrial:${input.source}:${input.userId}`;
  const url = `https://graph.facebook.com/v22.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`;
  const hashedEmail = hashEmail(input.email);

  const payload = {
    data: [
      {
        event_name: 'StartTrial',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        event_id: eventId,
        user_data: {
          external_id: input.userId,
          em: hashedEmail,
        },
        custom_data: {
          source: input.source,
        },
      },
    ],
    test_event_code: META_TEST_EVENT_CODE || undefined,
  };

  try {
    log('request', {
      source: input.source,
      userId: input.userId,
      eventId,
      url: `https://graph.facebook.com/v22.0/${META_PIXEL_ID}/events?...`,
      hasTestEventCode: !!META_TEST_EVENT_CODE,
      hasHashedEmail: !!hashedEmail,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.text();

    if (!response.ok) {
      console.error('[meta:starttrial:error]', JSON.stringify({
        source: input.source,
        userId: input.userId,
        eventId,
        status: response.status,
        body,
      }));
      return;
    }

    log('success', {
      source: input.source,
      userId: input.userId,
      eventId,
      status: response.status,
      body,
    });
  } catch (error) {
    console.error('[meta:starttrial:exception]', JSON.stringify({
      source: input.source,
      userId: input.userId,
      eventId,
      error: String((error as Error)?.message || error),
    }));
  }
}
