'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ConnectionErrorView from '@/components/views/ConnectionErrorView';

// ✅ Configuration extraite de votre GameOverlayClient
const GATEWAY_URL = 'http://localhost:4006';
const GATEWAY_PATH = '/socket.io';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: true, 
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        console.log(`🔌 Global Socket init: Connecting to ${GATEWAY_URL}`);

        const newSocket = io(GATEWAY_URL, {
            path: GATEWAY_PATH,          // Important : doit correspondre à votre config
            withCredentials: true,
            transports: ['websocket'],   // Force le websocket pour la stabilité
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        // --- Gestion des événements ---

        newSocket.on('connect', () => {
            console.log('✅ Global Socket Connected to Gateway (4006)');
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.warn('❌ Global Socket Disconnected:', reason);
            // On ignore les déconnexions volontaires du client (ex: changement de page qui démonterait le socket)
            if (reason !== "io client disconnect") {
                setIsConnected(false);
            }
        });

        newSocket.on('connect_error', (err) => {
            // Normalement, cette erreur ne devrait plus apparaître si le port 4006 est ouvert
            console.error(`🔥 Global Socket Connection Error:`, err.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {/* L'overlay s'affiche uniquement si isConnected est false */}
            {!isConnected && <ConnectionErrorView />}
            {children}
        </SocketContext.Provider>
    );
};