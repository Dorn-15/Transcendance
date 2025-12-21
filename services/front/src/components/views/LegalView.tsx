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

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 600;

  const handleTogglePrivacy = () => {
    const willOpen = !showPrivacy;
    
    if (willOpen && isMobile()) {
        setShowTerms(false);
    }
    
    setShowPrivacy(willOpen);
  };

  const handleToggleTerms = () => {
    const willOpen = !showTerms;
    
    if (willOpen && isMobile()) {
        setShowPrivacy(false);
    }
    
    setShowTerms(willOpen);
  };

  return (
    <div className="modal-container">
      
      <h2 className="modal-title">{texts.legal}</h2>
      
      <div className="legal-columns-container">
        
        {/* Privacy Policy Column */}
        <div className="legal-column">
            <button 
                className={`legal-accordion-btn ${showPrivacy ? 'open' : 'closed'}`}
                onClick={handleTogglePrivacy}
            >
                <span>{texts.privacyPolicy}</span>
                <span>{showPrivacy ? '▲' : '▼'}</span>
            </button>
            
            {showPrivacy && (
                <div className="legal-text-content">
                    <p><strong>{texts.effectiveDate}</strong> 21/12/2025</p>
                    
                    <p>
                        <strong>{texts.introduction}</strong><br/>
                        {texts.welcomeTo}
                    </p>
                    
                    <p>
                        <strong>{texts.dataCollected}</strong><br/>
                        {texts.mayCollect}<br/>
                        - <strong>{texts.listData}</strong>.
                    </p>
                    
                    <p>
                        <strong>{texts.howWeUsed}</strong><br/>
                        {texts.usedDataDesc}
                    </p>
                    
                    <p>
                        <strong>{texts.contactUs}</strong><br/>
                        {texts.contactText} <strong>adoireau@student.42.fr</strong>
                    </p>
                </div>
            )}
        </div>

        {/* Terms of Service Column */}
        <div className="legal-column">
            <button 
                className={`legal-accordion-btn ${showTerms ? 'open' : 'closed'}`}
                onClick={handleToggleTerms}
            >
                <span>{texts.termsOfService}</span>
                <span>{showTerms ? '▲' : '▼'}</span>
            </button>

            {showTerms && (
                <div className="legal-text-content">
                    <p><strong>{texts.lastUpdated}</strong> 21/12/2025</p>

                    <p>
                        <strong>{texts.acceptance}</strong><br/>
                        {texts.acceptanceDesc}
                    </p>

                    <p>
                        <strong>{texts.userConduct}</strong><br/>
                        {texts.conductDesc}
                    </p>

                    <p>
                        <strong>{texts.disclaimer}</strong><br/>
                        {texts.disclaimerDesc}
                    </p>

                    <p>
                        <strong>{texts.governingLaw}</strong><br/>
                        {texts.governingDesc}
                    </p>
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