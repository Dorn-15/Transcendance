import { NextResponse } from 'next/server';
import { AUTH_SERVICE_URL } from '../login/route';

export async function POST(request: Request) {
	try {
		const cookieHeader = request.headers.get('cookie') ?? '';
		const res = await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
			method: 'POST',
			headers: {
				Cookie: cookieHeader,
			},
		});

		const data = await res.json();
		const response = NextResponse.json(data, { status: res.status });

		const setCookie = res.headers.get('set-cookie');
		if (setCookie)
			response.headers.set('Set-Cookie', setCookie);
		else 
			response.cookies.set('Authentication', '', { path: '/', maxAge: 0 });

		return response;
	} catch (error) {
		console.error('Logout proxy error:', error);
		return NextResponse.json({ authenticated: false }, { status: 500 });
	}
}

