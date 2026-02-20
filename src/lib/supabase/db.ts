import { createServiceRoleClient } from './server';
import { User, UserProduct } from '@/types';

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
    .eq('product_id', 'festa-magica')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as UserProduct;
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
      product_id: 'festa-magica',
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
    .eq('product_id', 'festa-magica')
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
