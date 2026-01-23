import { createServiceRoleClient } from './server';
import { User, Subscription } from '@/types';

export async function getUserByHubId(hubUserId: string): Promise<User | null> {
  const supabase = await createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('hub_user_id', hubUserId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function createUser(hubUserId: string, email: string, name?: string): Promise<User> {
  const supabase = await createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      hub_user_id: hubUserId,
      email,
      name: name || email.split('@')[0],
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return data as User;
}

export async function getOrCreateUser(hubUserId: string, email: string, name?: string): Promise<User> {
  const existing = await getUserByHubId(hubUserId);
  if (existing) return existing;
  return createUser(hubUserId, email, name);
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', 'festa-magica')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as Subscription;
}

export async function activateSubscription(
  userId: string,
  activationCode: string,
  durationMonths: number = 3
): Promise<Subscription> {
  const supabase = await createServiceRoleClient();
  
  const startsAt = new Date();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      product_id: 'festa-magica',
      status: 'active',
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      activation_code: activationCode,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to activate subscription: ${error.message}`);
  return data as Subscription;
}

export async function validateActivationCode(code: string): Promise<boolean> {
  const supabase = await createServiceRoleClient();
  
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('activation_code', code)
    .single();

  return !data;
}

export async function checkNonceUsed(nonce: string): Promise<boolean> {
  const supabase = await createServiceRoleClient();
  
  const { data } = await supabase
    .from('used_nonces')
    .select('nonce')
    .eq('nonce', nonce)
    .single();

  return !!data;
}

export async function markNonceUsed(nonce: string): Promise<void> {
  const supabase = await createServiceRoleClient();
  
  await supabase
    .from('used_nonces')
    .insert({ nonce });
}

export async function createSession(userId: string): Promise<string> {
  const supabase = await createServiceRoleClient();
  
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    });

  return token;
}

export async function getSessionUser(token: string): Promise<{ user: User; subscription: Subscription | null } | null> {
  const supabase = await createServiceRoleClient();
  
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user_id)
    .single();

  if (!user) return null;

  const subscription = await getActiveSubscription(user.id);

  return { user: user as User, subscription };
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = await createServiceRoleClient();
  
  await supabase
    .from('sessions')
    .delete()
    .eq('token', token);
}
