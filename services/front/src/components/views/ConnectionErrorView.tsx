'use client';

import React from 'react';
import './ConnectionErrorView.css';

export default function ConnectionErrorView() {
    return (
        <div className="connection-overlay">
            <div className="connection-content">
                <h1 className="connection-title">⚠ CONNECTION LOST ⚠</h1>
                <p>Contact with the server has been severed.</p>
                <div className="loader"></div>
                <p>Attempting to reconnect...</p>
            </div>
        </div>
    );
}