'use client';

import './Breakout.css';
import { GameInfo } from '@/utils/languageData';

interface BreakoutProps {
    texts: GameInfo;
}

export default function BreakoutPlaceholder({ texts }: BreakoutProps) {
    return (
        <div className="container">
            <div className="wall">
                <div className="row red"></div>
                <div className="row orange"></div>
                <div className="row yellow"></div>
                <div className="row green"></div>
            </div>

            <div className="content">
                <h1 className="title">BREAKOUT</h1>
                <div className="icon">🚧 🔨 🧱</div>

                <div className="message">
                    <span style={{fontSize: '0.8em', opacity: 0.8}}>{texts.workIn}</span>
                    <p className="subtext">{texts.laterCoin}</p>
                </div>

                <div className="loader"></div>
            </div>
        </div>
    );
}
