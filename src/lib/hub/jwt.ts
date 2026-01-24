import { SignJWT, jwtVerify } from 'jose';

const HUB_JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || 'your-secret-key-min-32-characters-long'
);

export interface HubTokenPayload {
  sub: string; // hub_user_id
  email: string;
  name?: string;
  product: string;
  nonce: string;
  exp?: number;
  iat?: number;
}

export async function verifyHubToken(token: string): Promise<HubTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, HUB_JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.product !== 'festa-magica') {
      throw new Error('Token não é para este produto');
    }

    return payload as unknown as HubTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Token inválido ou expirado');
  }
}

export async function createHubToken(payload: Omit<HubTokenPayload, 'exp' | 'iat'>): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(HUB_JWT_SECRET);

  return token;
}

export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
