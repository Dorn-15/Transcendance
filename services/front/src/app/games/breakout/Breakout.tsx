'use client';

import styles from './Breakout.module.css';
import { GameInfo } from '@/utils/languageData';

interface BreakoutProps {
    texts: GameInfo;
}

export default function BreakoutPlaceholder({ texts }: BreakoutProps) {
    return (
        <div className={styles.container}>
            {/* Décoration : Le mur de briques */}
            <div className={styles.wall}>
                <div className={`${styles.row} ${styles.red}`}></div>
                <div className={`${styles.row} ${styles.orange}`}></div>
                <div className={`${styles.row} ${styles.yellow}`}></div>
                <div className={`${styles.row} ${styles.green}`}></div>
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>BREAKOUT</h1>
                <div className={styles.icon}>🚧 🔨 🧱</div>
         
                <div className={styles.message}>
                    <span style={{fontSize: '0.8em', opacity: 0.8}}>{texts.workIn}</span>
                    <p className={styles.subtext}>{texts.laterCoin}</p>
                </div>
                
                <div className={styles.loader}></div>
            </div>
        </div>
    );
}