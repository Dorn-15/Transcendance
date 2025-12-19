'use client'; 

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { preloadAsset } from '@/utils/assetLoader';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './LogIn.css';

export default function LogIn() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Calcul de la langue sécurisé
    const currentLang = useMemo<LangKey>(() => {
        const langParam = searchParams.get('lang');
        const paramValue = Number(langParam);
        return (langParam && ALL_LANGUAGES[paramValue]) 
            ? (paramValue as LangKey) 
            : 1;
    }, [searchParams]);

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;

    const [usernameInput, setUsernameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Préchargement des assets 3D pour qu'ils soient prêts après le login
    useEffect(() => {
        const assets = [
            "Breakout.glb",
            "Pong.glb",
            "SpaceInvaders.glb",
            "room.glb",
            "table.glb"
        ];
        assets.forEach(file => preloadAsset(file));
    }, []);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!usernameInput.trim()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput })
            });

            if (res.ok) {
                setUsernameInput('');
                router.refresh(); 
                router.push(`/?lang=${currentLang}`); 
            } else {
                alert("Login failed");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-box">
                <h3>{texts.welcome}</h3> 
                
                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        placeholder={texts.username} 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                        maxLength={15} // Limite raisonnable pour le design
                    />
                    <div className="login-actions">
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? '...' : texts.enter}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}