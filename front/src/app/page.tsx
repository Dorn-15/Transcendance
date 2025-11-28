// front/src/app/page.tsx
import Scene from './components/Scene';
import styles from './page.module.css'; // Assure-toi d'avoir du CSS pour positionner le menu

export default function Home() {
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      {/* Ton Menu HTML en React */}
      <header style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          zIndex: 10, 
          color: 'white', 
          textAlign: 'center',
          pointerEvents: 'none' // Pour pouvoir cliquer sur la 3D à travers le header vide
      }}>
        <h1 style={{ padding: '20px', pointerEvents: 'auto' }}>Mon Menu React</h1>
      </header>

      {/* Le composant 3D */}
      <Scene />
      
    </main>
  );
}