'use server'

import { cookies } from 'next/headers'

export async function LogOut() {
    // 1. Await cookies (Next.js 15+)
    const cookieStore = await cookies();
    
    // 2. Delete the cookie
    cookieStore.delete('Authentication');

    // 3. Do NOT redirect here. Just return.
}