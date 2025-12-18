'use client'; 

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Ajout de useSearchParams
import { preloadAsset } from '@/utils/assetLoader';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; // Import des datas de langue
import './LogIn.css';

export default function LogIn() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Récupération de la langue depuis l'URL (?lang=1) ou défaut à 1 (FR)
    const langParam = searchParams.get('lang');
    const currentLang: LangKey = (langParam && ALL_LANGUAGES[Number(langParam)]) 
        ? (Number(langParam) as LangKey) 
        : 1;

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;

    const [usernameInput, setUsernameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                // On redirige en gardant la langue actuelle
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
                {/* Utilisation du titre traduit depuis languageData.ts */}
                <h3>{texts.welcome}</h3> 
                
                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        /* Si tu ajoutes "username" dans ton languageData, utilise texts.username ici */
                        placeholder={texts.username} 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />
                    <div className="login-actions">
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {/* Tu peux utiliser texts.back ou ajouter un champ "enter" dans tes datas */}
                            {texts.enter}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}