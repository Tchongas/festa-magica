import { createServiceRoleClient } from './server';
import { User, UserProduct } from '@/types';
import { PRODUCT_ID } from '@/lib/config';

function normalizeEmail(email?: string | null): string {
  return String(email || '').trim().toLowerCase();
}

function getFallbackName(email: string): string {
  return email.includes('@') ? email.split('@')[0] : 'Usuário';
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createServiceRoleClient();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return null;

  const { data, error } = await supabase
    .from('hub_users')
    .select('*')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

export async function hasFestaMagicaProductByEmail(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user) return false;

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('user_products')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', PRODUCT_ID)
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

export async function ensureHubUserForAuthUser(authUser: { id: string; email?: string | null; user_metadata?: any }): Promise<User> {
  const supabase = createServiceRoleClient();
  const normalizedEmail = normalizeEmail(authUser.email);

  if (!normalizedEmail) {
    throw new Error('Authenticated user does not have a valid email');
  }

  const desiredName =
    authUser.user_metadata?.name ||
    authUser.user_metadata?.full_name ||
    getFallbackName(normalizedEmail);

  const byEmail = await getUserByEmail(normalizedEmail);
  if (byEmail) {
    const updates: Partial<User> = {};

    if ((byEmail.email || '').toLowerCase() !== normalizedEmail) {
      updates.email = normalizedEmail;
    }

    if (!byEmail.name?.trim() && desiredName) {
      updates.name = desiredName;
    }

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('hub_users')
        .update(updates)
        .eq('id', byEmail.id)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(`Failed to update hub user: ${error?.message || 'unknown error'}`);
      }

      return data as User;
    }

    return byEmail;
  }

  const { data: byId, error: byIdError } = await supabase
    .from('hub_users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (byIdError) {
    throw new Error(`Failed to fetch hub user by id: ${byIdError.message}`);
  }

  if (byId) {
    return byId as User;
  }

  const { data: created, error: createError } = await supabase
    .from('hub_users')
    .insert({
      id: authUser.id,
      email: normalizedEmail,
      name: desiredName,
    })
    .select('*')
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create hub user: ${createError?.message || 'unknown error'}`);
  }

  return created as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('hub_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getActiveUserProduct(userId: string): Promise<UserProduct | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('user_products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error || !data?.length) return null;

  const match = data.find((row) => {
    const productId = String((row as { product_id?: string }).product_id || '').trim().toLowerCase();
    const status = String((row as { status?: string }).status || '').trim().toLowerCase();
    return productId === PRODUCT_ID && status === 'active';
  });

  return (match as UserProduct) || null;
}

export async function checkNonceUsed(nonce: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  
  const { data } = await supabase
    .from('used_nonces')
    .select('nonce')
    .eq('nonce', nonce)
    .single();

  return !!data;
}

export async function markNonceUsed(nonce: string): Promise<void> {
  const supabase = createServiceRoleClient();
  
  await supabase
    .from('used_nonces')
    .insert({ nonce });
}

export async function createSession(userId: string): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      product_id: PRODUCT_ID,
      token,
      expires_at: expiresAt.toISOString(),
    });

  return token;
}

export async function getSessionUser(token: string): Promise<{ user: User; subscription: UserProduct | null } | null> {
  const supabase = createServiceRoleClient();
  
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .eq('product_id', PRODUCT_ID)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const user = await getUserById(session.user_id);
  if (!user) return null;

  const subscription = await getActiveUserProduct(user.id);

  return { user, subscription };
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = createServiceRoleClient();
  
  await supabase
    .from('sessions')
    .delete()
    .eq('token', token);
}
