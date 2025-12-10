// src/app/page.tsx
import GameCanva from '@/components/gameCanva';
import GameUI from '@/components/GameUI';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="game-container">
      
      <div className="canvas-wrapper">
        <GameCanva />
      </div>

      <Suspense fallback={null}>
        <GameUI />
      </Suspense>

    </main>
  );
}