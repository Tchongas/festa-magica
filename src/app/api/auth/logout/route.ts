import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/supabase/db';
import { createSupabaseServer } from '@/lib/supabase/server';
import { clearSessionCookie } from '@/lib/auth/helpers';
import { MEMBROS_URL } from '@/lib/config';

async function performLogout(): Promise<void> {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();

  const token = await clearSessionCookie();
  if (token) {
    await deleteSession(token);
  }
}

export async function POST(_request: NextRequest) {
  try {
    await performLogout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  return NextResponse.json({ success: true });
}

export async function GET(_request: NextRequest) {
  try {
    await performLogout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  return NextResponse.redirect(MEMBROS_URL);
}
