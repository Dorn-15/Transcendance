'use server'

import { AUTH_SERVICE_URL } from '../api/login/route'
import { cookies } from 'next/headers'

export async function LogOut() {
	const cookieStore = await cookies();
	const cookie = cookieStore.get('Authentication');

	if (cookie) {
		await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
			method: 'POST',
			headers: {
				Cookie: cookieStore.toString(),
			},
		}).catch((err) => {
			console.error('Logout failed:', err);
		});
	}

	cookieStore.delete('Authentication');
}
