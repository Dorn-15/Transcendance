'use client';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { initGame } from '@/utils/gameScene';
import { LangKey } from '@/utils/languageData';

export default function GameCanva() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();

    const gameControlsRef = useRef<{ destroy: () => void; updateLanguage: (id: LangKey) => void } | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const params = new URLSearchParams(window.location.search);
        const langParam = params.get('lang');
        const initialLang = (langParam ? parseInt(langParam) : 1) as LangKey;

        const controls = initGame(canvasRef.current, initialLang);
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

    return <canvas id="renderCanvas" ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}