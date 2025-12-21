import { cookies } from 'next/headers';
import { AUTH_SERVICE_URL } from './login/route';

export type AuthStatus =
    | { authenticated: false }
    | { authenticated: true; username: string };

const AUTH_URL = AUTH_SERVICE_URL;

export async function getAuthStatus(): Promise<AuthStatus> {
    // Await cookies() to be safe across Next.js versions
    const cookieStore = await cookies();

    try {
        const res = await fetch(`${AUTH_URL}/auth/status`, {
            headers: {
                // Ensure we send the string representation
                Cookie: cookieStore.toString(),
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return { authenticated: false };
        }
        return res.json();
    } catch (e) {
        console.error("Auth Fetch Error:", e);
        return { authenticated: false };
    }
}
