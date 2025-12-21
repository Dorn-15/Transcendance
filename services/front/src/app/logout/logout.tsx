'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation' 

export async function LogOut(lang: number = 1) {
    const cookieStore = await cookies();
    
    cookieStore.delete('Authentication');

    redirect(`/?lang=${lang}`);
}