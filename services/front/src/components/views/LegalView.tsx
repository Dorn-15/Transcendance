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
                        We may collect the following types of information:<br/>
                        - <strong>[LIST DATA, e.g., Email, Username, Game Stats]</strong>.
                    </p>
                    
                    <p>
                        <strong>3. How We Use Your Data</strong><br/>
                        Your data is used to provide and improve the Service, specifically for <strong>[PURPOSE, e.g., authentication, leaderboard tracking]</strong>.
                    </p>
                    
                    <p>
                        <strong>4. Contact Us</strong><br/>
                        If you have any questions about this Privacy Policy, please contact us at: <strong>[INSERT CONTACT EMAIL]</strong>.
                    </p>
                </div>
            )}
        </div>

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
                    <p><strong>Last Updated:</strong> [INSERT DATE]</p>

                    <p>
                        <strong>1. Acceptance of Terms</strong><br/>
                        By accessing and using <strong>[APP NAME]</strong>, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>

                    <p>
                        <strong>2. User Conduct</strong><br/>
                        You agree not to engage in any of the following prohibited activities: <strong>[LIST ACTIVITIES, e.g., cheating, hacking, distributing spam]</strong>.
                    </p>

                    <p>
                        <strong>3. Disclaimer</strong><br/>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties regarding the reliability or accuracy of the Service.
                    </p>

                    <p>
                        <strong>4. Governing Law</strong><br/>
                        These Terms shall be governed in accordance with the laws of <strong>[INSERT COUNTRY/STATE]</strong>.
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