// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authHost = process.env.AUTH_HOST ?? 'localhost:4001';
const authStatusUrl = `http://${authHost}/auth/status`;

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	if (path.startsWith('/assets')) {
		return NextResponse.next();
	}

	const isPublicPath = path === '/login' || path === '/register';
	const cookie = request.cookies.get('Authentication')?.value || '';

	// No cookie -> redirect if protected
	if (!cookie && !isPublicPath) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Validate cookie with backend
	if (cookie) {
		try {
			const res = await fetch(authStatusUrl, {
				headers: { Cookie: `Authentication=${cookie}` },
				cache: 'no-store',
			});

			if (!res.ok) {
				if (!isPublicPath) {
					return NextResponse.redirect(new URL('/login', request.url));
				}
				return NextResponse.next();
			}

			const data = await res.json();
			const authenticated = Boolean(data?.authenticated);

			if (!authenticated && !isPublicPath) {
				return NextResponse.redirect(new URL('/login', request.url));
			}

			if (authenticated && isPublicPath) {
				return NextResponse.redirect(new URL('/', request.url));
			}
		} catch (error) {
			console.error('Middleware auth check failed:', error);
			if (!isPublicPath) {
				return NextResponse.redirect(new URL('/login', request.url));
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
	],
}
