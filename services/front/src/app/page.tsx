import GameCanva from '@/components/gameCanva';
import Navbar from '@/components/header/Navbar.server';
import { getAuthStatus } from './api/getAuthStatus';
import { Suspense } from 'react';

import LogIn from '../components/views/LogIn';

export const dynamic = 'force-dynamic';


export default async function Home() {
  return (
    <main className="game-container">

      <Navbar />
      <div className="canvas-wrapper">
        <GameCanva />
      </div>
    </main>
  );
}
