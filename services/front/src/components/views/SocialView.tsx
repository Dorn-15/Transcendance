'use client';

import { useState } from 'react';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './SocialView.css';

interface SocialViewProps {
    onClose: () => void;
    currentLang: LangKey;
}

export default function SocialView({ onClose, currentLang }: SocialViewProps) {
  const texts = ALL_LANGUAGES[currentLang].defaultInfo;

  const [friends, setFriends] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddFriend = () => {
    if (inputValue.trim() !== '') {
      // Évite les doublons
      if (!friends.includes(inputValue.trim())) {
          setFriends([...friends, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddFriend();
  };

  const handleRemoveFriend = (indexToRemove: number) => {
    setFriends(friends.filter((_, index) => index !== indexToRemove));
  };

  return (
    // J'ai ajouté une classe spécifique 'social-modal' pour gérer la hauteur via CSS
    <div className="modal-container social-modal">
      
      <h2 className="modal-title">{texts.social}</h2>
      
      <div className="add-friend-container">
        <input 
            type="text" 
            placeholder="Pseudo..." 
            className="friend-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={15}
        />
        <button className="btn-add" onClick={handleAddFriend} aria-label="Add friend">
            ➕
        </button>
      </div>

      <div className="friends-list">
        {friends.length === 0 ? (
            <div className="no-friends-container">
                <p className="no-friends">{texts.noFriends}</p>
            </div>
        ) : (
            friends.map((friend, index) => (
                <div key={index} className="friend-item">
                    <span className="friend-name">👤 {friend}</span>
                    <button 
                        className="btn-remove" 
                        onClick={() => handleRemoveFriend(index)}
                        title="Supprimer"
                        aria-label="Remove friend"
                    >
                        🗑️
                    </button>
                </div>
            ))
        )}
      </div>
      
      <button className="btn-back" onClick={onClose}>
        {texts.back || "Retour"}
      </button>
      
    </div>
  );
}