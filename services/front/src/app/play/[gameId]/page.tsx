// src/app/play/[gameId]/page.tsx
import { cookies } from 'next/headers';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; // Vérifiez l'import LangKey
import GameOverlayClient from './GameOverlayClient';

// Définition du type pour les props de page en Next.js récent
type PageProps = {
    params: Promise<{ gameId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
    // 1. On attend que les searchParams soient résolus (Fix pour Next.js 15+)
    const searchParams = await props.searchParams;
    
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('Authentication');
    const userName = authCookie ? decodeURIComponent(authCookie.value) : 'GUEST';

    // 2. On récupère la langue
    const rawLang = searchParams.lang;
    const langId = Number(rawLang);

    // 3. Sécurité : Si langId est invalide, on prend 1
    const safeLangId: LangKey = (langId && ALL_LANGUAGES[langId]) 
        ? (langId as LangKey) 
        : 1;

    console.log("SERVER PAGE LANG DETECTED:", safeLangId); // Regardez votre terminal serveur

    const texts = ALL_LANGUAGES[safeLangId].defaultInfo;

    return <GameOverlayClient userName={userName} texts={texts} />;
}