'use client';

import { useState } from 'react';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './LegalView.css';

interface LegalViewProps {
    onClose: () => void;
    currentLang: LangKey;
}

export default function LegalView({ onClose, currentLang }: LegalViewProps) {
  const texts = ALL_LANGUAGES[currentLang].defaultInfo;

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Fonction utilitaire pour vérifier si on est sur mobile (correspond au CSS max-width: 600px)
  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 600;

  const handleTogglePrivacy = () => {
    const willOpen = !showPrivacy;
    
    // Si on s'apprête à ouvrir et qu'on est sur mobile, on ferme l'autre
    if (willOpen && isMobile()) {
        setShowTerms(false);
    }
    
    setShowPrivacy(willOpen);
  };

  const handleToggleTerms = () => {
    const willOpen = !showTerms;
    
    // Si on s'apprête à ouvrir et qu'on est sur mobile, on ferme l'autre
    if (willOpen && isMobile()) {
        setShowPrivacy(false);
    }
    
    setShowTerms(willOpen);
  };

  return (
    <div className="modal-container">
      
      <h2 className="modal-title">{texts.legal}</h2>
      
      <div className="legal-columns-container">
        
        {/* Colonne PRIVACY POLICY */}
        <div className="legal-column">
            <button 
                className={`legal-accordion-btn ${showPrivacy ? 'open' : 'closed'}`}
                onClick={handleTogglePrivacy}
            >
                <span>PRIVACY POLICY</span>
                <span>{showPrivacy ? '▲' : '▼'}</span>
            </button>
            
            {showPrivacy && (
                <div className="legal-text-content">
                    <strong>Effective Date:</strong> [INSERT DATE]<br/><br/>
                    
                    <strong>1. Introduction</strong><br/>
                    Welcome to <strong>[APP NAME]</strong>. We respect your privacy and are committed to protecting your personal data.<br/><br/>
                    
                    <strong>2. Data We Collect</strong><br/>
                    We may collect the following types of information:<br/>
                    - <strong>[LIST DATA, e.g., Email, Username, Game Stats]</strong>.<br/><br/>
                    
                    <strong>3. How We Use Your Data</strong><br/>
                    Your data is used to provide and improve the Service, specifically for <strong>[PURPOSE, e.g., authentication, leaderboard tracking]</strong>.<br/><br/>
                    
                    <strong>4. Contact Us</strong><br/>
                    If you have any questions about this Privacy Policy, please contact us at: <strong>[INSERT CONTACT EMAIL]</strong>.
                </div>
            )}
        </div>

        {/* Colonne TERM OF SERVICE */}
        <div className="legal-column">
            <button 
                className={`legal-accordion-btn ${showTerms ? 'open' : 'closed'}`}
                onClick={handleToggleTerms}
            >
                <span>TERM OF SERVICE</span>
                <span>{showTerms ? '▲' : '▼'}</span>
            </button>

            {showTerms && (
                <div className="legal-text-content">
                    <strong>Last Updated:</strong> [INSERT DATE]<br/><br/>

                    <strong>1. Acceptance of Terms</strong><br/>
                    By accessing and using <strong>[APP NAME]</strong>, you accept and agree to be bound by the terms and provision of this agreement.<br/><br/>

                    <strong>2. User Conduct</strong><br/>
                    You agree not to engage in any of the following prohibited activities: <strong>[LIST ACTIVITIES, e.g., cheating, hacking, distributing spam]</strong>.<br/><br/>

                    <strong>3. Disclaimer</strong><br/>
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties regarding the reliability or accuracy of the Service.<br/><br/>

                    <strong>4. Governing Law</strong><br/>
                    These Terms shall be governed in accordance with the laws of <strong>[INSERT COUNTRY/STATE]</strong>.
                </div>
            )}
        </div>

      </div>
      
      <button className="btn-back" onClick={onClose}>
        {texts.back}
      </button>
      
    </div>
  );
}