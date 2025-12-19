import { cookies } from 'next/headers';
import GameCanva from '@/components/gameCanva';
import Navbar from '@/components/header/Navbar.server';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; // Assurez-vous que le chemin est bon

export const dynamic = 'force-dynamic';

// On ajoute les types pour les paramètres de page (searchParams)
export default async function Home({
  searchParams
}: {
  searchParams: { lang?: string }
}) {
  // 1. Gestion du Cookie (Authentification)
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('Authentication');
  const userName = authCookie ? decodeURIComponent(authCookie.value) : 'Joueur';

  // 2. Gestion de la Langue (URL)
  // On lit ?lang= dans l'URL. Si absent ou invalide, on force 1 (Français).
  const langParam = searchParams.lang;
  const paramValue = Number(langParam);
  
  const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue]) 
      ? (paramValue as LangKey) 
      : 1;

  return (
    <main className="game-container">
      <Navbar /> 
      <div className="canvas-wrapper">
        {/* 
           3. On passe 'currentLang' à GameCanva.
           NOTE : GameCanva va souligner ça en rouge car on n'a pas encore modifié 
           GameCanva pour accepter cette prop. C'est la prochaine étape.
        */}
        <GameCanva userName={userName} initialLang={currentLang} /> 
      </div>
    </main>
  );
}