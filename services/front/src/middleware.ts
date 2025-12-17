// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Get the current path
  const path = request.nextUrl.pathname;

  // 2. Define public paths (pages that do not require login)
  const isPublicPath = path === '/login' || path === '/register';

  const token = request.cookies.get('Authentication')?.value || '';

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

// 5. Config to match which paths this middleware runs on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}