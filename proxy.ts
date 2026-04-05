import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');

  if (isAuthRoute) return NextResponse.next();

  if (isOnDashboard && !token) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
