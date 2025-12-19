import { cookies } from 'next/headers';
import NavbarClient from './Navbar.client';

export const dynamic = 'force-dynamic';

export default async function Navbar() {
    // Récupération des cookies côté serveur
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Authentication');

    // On récupère la valeur. Si le cookie n'existe pas, on affiche "Invité" 
    // decodeURIComponent est utilisé au cas où le cookie contienne des caractères spéciaux (ex: @)
    const userName = authCookie ? decodeURIComponent(authCookie.value) : 'Invité';

    return <NavbarClient userName={userName} />;
}