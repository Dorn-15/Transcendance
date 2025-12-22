import NavbarClient from './Navbar.client';
import { getAuthStatus } from '@/app/api/getAuthStatus';

export const dynamic = 'force-dynamic';

export default async function Navbar() {
	const status = await getAuthStatus();
	const userName = status.authenticated ? status.username : 'Invité';

    return <NavbarClient userName={userName} />;
}
