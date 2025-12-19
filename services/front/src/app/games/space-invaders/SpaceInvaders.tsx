'use client';

import styles from './SpaceInvaders.module.css';
import { GameInfo } from '@/utils/languageData';

interface SpaceInvadersProps {
    texts: GameInfo;
}

export default function SpaceInvadersPlaceholder({ texts }: SpaceInvadersProps) {
    return (
        <div className={styles.container}>
            <div className={styles.scanline}></div>
            
            <div className={styles.invaderGroup}>
                <div className={`${styles.invader} ${styles.move1}`}>👾</div>
                <div className={`${styles.invader} ${styles.move2}`}>👾</div>
                <div className={`${styles.invader} ${styles.move3}`}>👾</div>
            </div>

            <h1 className={styles.title}>SPACE INVADERS</h1>
            
            <div className={styles.messageBox}>
                <p className={styles.text}>
                    {/* Utilisation des textes dynamiques */}
                    {texts.loading.toUpperCase()}...
                </p>
                <p className={styles.subtext}>{texts.coin}</p>
            </div>
        </div>
    );
}