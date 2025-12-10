import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

interface StatsViewProps {
    onClose: () => void;
    currentLang: LangKey;
}

export default function StatsView({ onClose, currentLang }: StatsViewProps) {
  const texts = ALL_LANGUAGES[currentLang].defaultInfo;

  return (
    <div className="modal-container">
      
      <h2 className="modal-title">{texts.stat}</h2>
      
      <p className="modal-content">
        {texts.win} : 42 <br/>
        {texts.lose}: 3
      </p>
      
      <button className="btn-back" onClick={onClose}>
        {texts.back}
      </button>
      
    </div>
  );
}