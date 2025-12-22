import { cookies } from 'next/headers';
import { AUTH_SERVICE_URL } from './login/route';

export type AuthStatus =
    | { authenticated: false }
    | { authenticated: true; username: string };

const AUTH_URL = AUTH_SERVICE_URL;

export async function getAuthStatus(): Promise<AuthStatus> {
    const cookieStore = await cookies();

    try {
        const res = await fetch(`${AUTH_URL}/auth/status`, {
            headers: {
                Cookie: cookieStore.toString(),
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return { authenticated: false };
        }
        return res.json();
    } catch (e) {
        return { authenticated: false };
    }
}
