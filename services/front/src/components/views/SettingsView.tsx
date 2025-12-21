'use client';

import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; 
import './SettingView.css';

interface SettingsProps {
    onClose: () => void;
    currentLang: LangKey;
    onLanguageChange: (lang: LangKey) => void;
}

export default function SettingsView({ onClose, currentLang, onLanguageChange }: SettingsProps) {
  
  const texts = ALL_LANGUAGES[currentLang].defaultInfo;
  
  const languages = [
    { id: 1, label: "Français"},
    { id: 2, label: "English"},
    { id: 3, label: "Español"},
    { id: 4, label: "Deutsch"}
  ];

  return (
    <div className="modal-container">
      <h2 className="modal-title">{texts.param}</h2>
      
      <div className="lang-list">
        {languages.map((lang) => (
            <div 
                key={lang.id} 
                className={`lang-option ${currentLang === lang.id ? 'active' : ''}`}
                onClick={() => onLanguageChange(lang.id as LangKey)}
                role="button"
                tabIndex={0}
            >
                <span className="lang-label">{lang.label}</span>

                <div className="lang-check"></div>
            </div>
        ))}
      </div>
      
      <button className="btn-back" onClick={onClose}>
        {texts.back}
      </button>
    </div>
  );
}