import { cookies } from 'next/headers';
import NavbarClient from './Navbar.client';

export const dynamic = 'force-dynamic';

export default async function Navbar() {
    return <NavbarClient />;
}