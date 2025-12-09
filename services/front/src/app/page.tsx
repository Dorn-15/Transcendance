import GameCanva from '@/components/gameCanva'; // Ton composant 3D (vérifie la majuscule du fichier)
import GameUI from '@/components/GameUI';       // Ton composant Interface
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 1. La couche 3D (en arrière-plan) */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <GameCanva />
      </div>

      {/* 2. L'interface UI (au-dessus) */}
      {/* Suspense est nécessaire car GameUI utilise useSearchParams */}
      <Suspense fallback={null}>
        <GameUI />
      </Suspense>

    </main>
  );
}