'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { initGame } from '@/utils/gameScene';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

export default function GameCanva() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();
    
    // 1. État pour le chargement
    const [isLoading, setIsLoading] = useState(true);

    const gameControlsRef = useRef<{ destroy: () => void; updateLanguage: (id: LangKey) => void } | null>(null);

    const langParam = searchParams.get('lang');
    const currentLang: LangKey = (langParam && ALL_LANGUAGES[Number(langParam)]) 
        ? (Number(langParam) as LangKey) 
        : 1;

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;

    useEffect(() => {
        if (!canvasRef.current) return;

        // 2. On passe le callback qui désactive le chargement
        const controls = initGame(canvasRef.current, currentLang, () => {
            setIsLoading(false);
        });
        
        gameControlsRef.current = controls;

        return () => {
            if (gameControlsRef.current) {
                gameControlsRef.current.destroy();
                gameControlsRef.current = null;
            }
        };
    }, []); 

    useEffect(() => {
        const langParam = searchParams.get('lang');

        if (gameControlsRef.current && langParam) {
            const newLang = parseInt(langParam) as LangKey;
            gameControlsRef.current.updateLanguage(newLang);
        }
    }, [searchParams]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* 3. L'écran de chargement */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1a1a1a', // Couleur de fond
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 10,
                    transition: 'opacity 0.5s ease-out'
                }}>
                    <div className="loader-spinner"></div> {/* Vous pouvez ajouter du CSS pour un spinner */}
                    <h2>{texts.loading}</h2>
                </div>
            )}

            <canvas id="renderCanvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}