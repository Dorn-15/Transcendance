import { NextResponse } from 'next/server';

function getAuthServiceUrl(): string {
	if (process.env.AUTH_HOST)
		return `http://${process.env.AUTH_HOST}`;
	return 'http://localhost:4001';
}

export const AUTH_SERVICE_URL = getAuthServiceUrl();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok)
            return NextResponse.json({ authenticated: false }, { status: res.status });

        const data = await res.json();
        const response = NextResponse.json(data);
        const setCookieHeader = res.headers.get('set-cookie');

        if (setCookieHeader)
            response.headers.set('Set-Cookie', setCookieHeader);

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
