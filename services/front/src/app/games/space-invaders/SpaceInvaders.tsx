'use client';

import './SpaceInvaders.css';
import { GameInfo } from '@/utils/languageData';

interface SpaceInvadersProps {
    texts: GameInfo;
}

export default function SpaceInvadersPlaceholder({ texts }: SpaceInvadersProps) {
    return (
        <div className="container">
            <div className="scanline"></div>

            <div className="invaderGroup">
                <div className="invader move1">👾</div>
                <div className="invader move2">👾</div>
                <div className="invader move3">👾</div>
            </div>

            <h1 className="title">SPACE INVADERS</h1>

            <div className="messageBox">
                <p className="text">
                    {texts.loading.toUpperCase()}...
                </p>
                <p className="subtext">{texts.coin}</p>
            </div>
        </div>
    );
}
