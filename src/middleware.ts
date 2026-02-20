import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/criar'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const sessionToken = request.cookies.get('fm_session')?.value;

    if (!sessionToken) {
      const membrosUrl = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';
      return NextResponse.redirect(membrosUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/criar/:path*'],
};
