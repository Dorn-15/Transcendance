import { cookies } from 'next/headers';

//improt {getAuthStatus} from 'getAuthStatus';

export type AuthStatus =
    | { authenticated: false }
    | { authenticated: true; username: string };

const AUTH_URL = "http://localhost:4001"
// const AUTH_URL = "http://auth_service:4001"

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
            console.log("Navbar Server: Auth check failed with status:", res.status);
            return { authenticated: false };
        }
        return res.json();
    } catch (e) {
        console.error("Auth Fetch Error:", e);
        return { authenticated: false };
    }
}