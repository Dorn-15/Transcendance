'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { initGame } from '@/utils/gameScene';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './gameCanva.css';

interface GameCanvaProps {
    userName: string;
    initialLang: LangKey;
}

export default function GameCanva({ userName, initialLang }: GameCanvaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const gameControlsRef = useRef<{ destroy: () => void; updateLanguage: (id: LangKey) => void } | null>(null);

    const effectiveLang = useMemo(() => {
        if (initialLang && ALL_LANGUAGES[initialLang]) return initialLang;
        const urlLang = Number(searchParams.get('lang'));
        if (urlLang && ALL_LANGUAGES[urlLang]) return urlLang as LangKey;
        return 1;
    }, [initialLang, searchParams]);

    const texts = ALL_LANGUAGES[effectiveLang].defaultInfo;

    const gamesList = useMemo(() => [
        {
            id: 'pong',
            label: 'PONG',
            icon: '🏓',
            desc: texts.descPong || 'Classic Retro Tennis'
        },
        {
            id: 'breakout',
            label: 'BREAKOUT',
            icon: '🧱',
            desc: texts.descBreakout || 'Destroy the Bricks'
        },
        {
            id: 'space-invaders',
            label: 'SPACE INVADERS',
            icon: '👾',
            desc: texts.descSpaceInvaders || 'Defend Earth'
        },
    ], [texts]);
    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setIsChecked(true);
            if (mobile) setIsLoading(false);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    useEffect(() => {
        if (!isChecked) return;
        if (isMobile) return;
        if (!canvasRef.current) return;

        const controls = initGame(canvasRef.current, effectiveLang, () => {
            setIsLoading(false);
        });

        gameControlsRef.current = controls;

        return () => {
            if (gameControlsRef.current) {
                gameControlsRef.current.destroy();
                gameControlsRef.current = null;
            }
        };
    }, [isChecked, isMobile]);

    useEffect(() => {
        const langParam = searchParams.get('lang');
        if (!isMobile && gameControlsRef.current && langParam) {
            const newLang = parseInt(langParam, 10);
            if (!isNaN(newLang) && ALL_LANGUAGES[newLang]) {
                gameControlsRef.current.updateLanguage(newLang as LangKey);
            }
        }
    }, [searchParams, isMobile]);

    const handleGameClick = (gameId: string) => {
        router.push(`/play/${gameId}?lang=${effectiveLang}`);
    };

    if (!isChecked) return <div style={{ background: '#000', width: '100%', height: '100%' }}></div>;

    if (isMobile) {
        return (
            <div className="mobile-menu-container">
                <div className="mobile-header">
                    <h1>ARCADE ROOM</h1>
                    <p>{texts.welcome} <span style={{color: '#f37022'}}>{userName}</span></p>
                </div>

                <div className="game-list">
                    {gamesList.map((game) => (
                        <div
                            key={game.id}
                            className="game-card"
                            onClick={() => handleGameClick(game.id)}
                        >
                            <div className="game-icon">{game.icon}</div>
                            <div className="game-info">
                                <h2>{game.label}</h2>
                                <span>{game.desc}</span>
                            </div>
                            <button className="play-btn">{texts.play}</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {isLoading && (
                <div className="loader-container">
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
