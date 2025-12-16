import { cookies } from 'next/headers';
import NavbarClient from './Navbar.client';

export const dynamic = 'force-dynamic';

type AuthStatus =
    | { authenticated: false }
    | { authenticated: true; username: string };

const AUTH_URL = "http://transcendance-auth_service:4001"

async function getAuthStatus(): Promise<AuthStatus> {
    const cookieStore = cookies();

    try {
        const res = await fetch(`${AUTH_URL}/auth/status`, {
            headers: {
                Cookie: cookieStore.toString(),
            },
            cache: 'no-store',
        });

        if (!res.ok)
            return { authenticated: false };
        return res.json();
    } catch (e) {
        console.error("Erreur fetch auth:", e);
        return { authenticated: false };
    }
}

export default async function Navbar() {
    const authStatus = await getAuthStatus();

    return <NavbarClient authStatus={authStatus} />;
}