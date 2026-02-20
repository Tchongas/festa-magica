import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/supabase/db';
import { cookies } from 'next/headers';

const MEMBROS_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('fm_session')?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    cookieStore.delete('fm_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('fm_session')?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  cookieStore.delete('fm_session');

  return NextResponse.redirect(MEMBROS_URL);
}
