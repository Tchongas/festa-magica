import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Activation is handled by the Hub. Please activate your code at the Hub portal.' },
    { status: 400 }
  );
}
