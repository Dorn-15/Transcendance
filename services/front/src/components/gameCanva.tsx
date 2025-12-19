'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { initGame } from '@/utils/gameScene';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

// Mise à jour de l'interface pour accepter userName ET initialLang
interface GameCanvaProps {
    userName: string;
    initialLang: LangKey; // La langue passée par le serveur (page.tsx)
}

export default function GameCanva({ userName, initialLang }: GameCanvaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();
    
    // 1. État pour le chargement
    const [isLoading, setIsLoading] = useState(true);

    const gameControlsRef = useRef<{ destroy: () => void; updateLanguage: (id: LangKey) => void } | null>(null);

    // On utilise directement la prop 'initialLang' pour définir les textes initiaux
    // Cela évite que le texte soit en français puis change brutalement
    const texts = ALL_LANGUAGES[initialLang].defaultInfo;

    useEffect(() => {
        if (!canvasRef.current) return;

        // 2. On initialise le jeu avec la langue reçue en prop (initialLang)
        const controls = initGame(canvasRef.current, initialLang, () => {
            setIsLoading(false);
        });
        
        gameControlsRef.current = controls;

        return () => {
            if (gameControlsRef.current) {
                gameControlsRef.current.destroy();
                gameControlsRef.current = null;
            }
        };
        // On met initialLang dans les dépendances pour être propre, 
        // mais en pratique le initGame ne se lance qu'au montage.
    }, []); 

    // 3. Ce useEffect gère le changement de langue dynamique (si on clique sur un drapeau sans recharger la page)
    useEffect(() => {
        const langParam = searchParams.get('lang');

        if (gameControlsRef.current && langParam) {
            const newLang = parseInt(langParam) as LangKey;
            // On vérifie que c'est une langue valide avant de mettre à jour
            if (ALL_LANGUAGES[newLang]) {
                gameControlsRef.current.updateLanguage(newLang);
            }
        }
    }, [searchParams]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* L'écran de chargement utilise maintenant les textes traduits correctement dès le départ */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1a1a1a', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 10,
                    transition: 'opacity 0.5s ease-out'
                }}>
                    <div className="loader-spinner"></div>
                    <h2>{texts.loading}</h2>
                    <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.5 }}>
                        Connecting as {userName}...
                    </p>
                </div>
            )}

            <canvas id="renderCanvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}