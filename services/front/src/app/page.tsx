import GameCanva from '@/components/gameCanva';
import Navbar from '@/components/header/Navbar.server';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="game-container">

      <Navbar />
      <div className="canvas-wrapper">
        <GameCanva />
      </div>


    </main>
  );
}
