// services/front/src/components/GameCanvas.tsx
'use client'; // Obligatoire car on utilise useRef et useEffect

import { useEffect, useRef } from 'react';

import { initGame } from '@/utils/gameScene'; 

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      // Initialise le jeu en lui passant la référence du div
      const gameInstance = initGame(containerRef.current);

      // Fonction de nettoyage (très important en React/Next.js)
      return () => {
        // Ajoute une méthode destroy() dans ta gameScene pour nettoyer
        // les event listeners, arrêter la boucle requestAnimationFrame, etc.
        if (gameInstance && typeof gameInstance.destroy === 'function') {
          gameInstance.destroy();
        }
        // Vider le conteneur si nécessaire
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="game-container" 
      className="w-full h-screen relative" // Classes Tailwind
    />
  );
}