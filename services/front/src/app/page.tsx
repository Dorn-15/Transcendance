// src/app/page.tsx
import { cookies } from 'next/headers';
import GameCanva from '@/components/gameCanva';
import Navbar from '@/components/header/Navbar.server';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

export const dynamic = 'force-dynamic';

// 1. On définit le type des props (Next.js 15 demande souvent une Promise)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. On ajoute l'argument 'props' à la fonction
export default async function Home(props: Props) {
  // 3. On attend la résolution des paramètres (IMPORTANT pour Next.js récent)
  const searchParams = await props.searchParams;

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('Authentication');
  const userName = authCookie ? decodeURIComponent(authCookie.value) : 'Joueur';

  // 4. On lit la langue. Si invalide ou absent -> 1 (Français)
  const langParam = searchParams.lang;
  const paramValue = Number(langParam);
  
  const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue]) 
      ? (paramValue as LangKey) 
      : 1;

  return (
    <main className="game-container">
      <Navbar /> 
      <div className="canvas-wrapper">
        {/* 5. On transmet la langue calculée */}
        <GameCanva userName={userName} initialLang={currentLang} /> 
      </div>
    </main>
  );
}