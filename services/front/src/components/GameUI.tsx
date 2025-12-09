'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

export default function GameUI() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // État pour la langue (par défaut 1)
    const [currentLang, setCurrentLang] = useState<LangKey>(1);

    // Au chargement, on vérifie si l'URL contient ?lang=X
    useEffect(() => {
        const langParam = searchParams.get('lang');
        if (langParam) {
            const parsed = parseInt(langParam);
            if (parsed >= 1 && parsed <= 3) {
                setCurrentLang(parsed as LangKey);
            }
        }
    }, [searchParams]);

    // Fonction pour changer de langue (remplace cycleLanguage)
    const cycleLanguage = () => {
        const nextLang = ((currentLang % 3) + 1) as LangKey;
        setCurrentLang(nextLang);
        
        // Mise à jour de l'URL sans recharger la page
        router.push(`/?lang=${nextLang}`, { scroll: false });
    };

    // Récupération des textes actuels
    const texts = ALL_LANGUAGES[currentLang].defaultInfo;

    return (
        <div className="title-overlay">
            <div className="main-title">TRANSCENDANCE</div>

            <nav className="main-menu">
                <button id="btn-settings">{texts.param}</button>
                <button id="btn-social">{texts.social}</button>
                <button id="btn-stats">{texts.stat}</button>
                
                <button onClick={cycleLanguage}>
                    🌐 Lang ({currentLang})
                </button>
            </nav>
        </div>
    );
}