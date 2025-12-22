import { NextResponse } from 'next/server';
import { AUTH_SERVICE_URL } from '../login/route';

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const res = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		console.error('Register proxy error:', error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}

