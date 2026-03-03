import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Webhook desativado neste app. Processamento centralizado no Hub.',
    },
    { status: 410 }
  );
}
