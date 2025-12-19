import { NextResponse } from 'next/server';

// const AUTH_SERVICE_URL = "http://auth_service:4001";
const AUTH_SERVICE_URL = "http://localhost:4001";


export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Forward login to Backend
        const res = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json({ authenticated: false }, { status: res.status });
        }

        const data = await res.json();
        const response = NextResponse.json(data);

        // 2. CRITICAL: Capture Set-Cookie header safely
        // Node's fetch sometimes hides 'set-cookie' inside a distinct list
        const setCookieHeader = res.headers.get('set-cookie');
        
        if (setCookieHeader) {
            response.headers.set('Set-Cookie', setCookieHeader);
        } else {
            console.warn("⚠️ Proxy: Backend returned 200 OK but NO Set-Cookie header found!");
        }

        return response;
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}