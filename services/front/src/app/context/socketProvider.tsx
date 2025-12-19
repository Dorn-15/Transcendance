'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GatewayConfig } from './gatewayConfig.server';
import ConnectionErrorView from '@/components/views/ConnectionErrorView';

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

type SocketProviderProps = {
	children: React.ReactNode;
	gatewayConfig: GatewayConfig;
};

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: true,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, gatewayConfig }: SocketProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	// État technique (Vrai état du socket)
	const [isConnected, setIsConnected] = useState(true);

	// État visuel (Ce qu'on montre à l'utilisateur)
	const [showErrorScreen, setShowErrorScreen] = useState(false);

	// Timer pour gérer le délai d'affichage
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	// -----------------------------------------------------------
	// 1. LOGIQUE ANTI-CLIGNOTEMENT (GRACE PERIOD)
	// -----------------------------------------------------------
	useEffect(() => {
		if (isConnected) {
			// Si connecté, on annule tout timer d'erreur et on cache l'écran
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
			setShowErrorScreen(false);
		} else {
			// Si déconnecté, on attend 1 seconde avant d'afficher l'erreur.
			// Cela permet au F5 de se terminer sans flasher l'écran rouge.
			if (debounceTimer.current) clearTimeout(debounceTimer.current);

			debounceTimer.current = setTimeout(() => {
				setShowErrorScreen(true);
			}, 1000); // 1000ms = 1 seconde de tolérance
		}

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [isConnected]);


	// -----------------------------------------------------------
	// 2. LOGIQUE SOCKET (IDENTIQUE À AVANT)
	// -----------------------------------------------------------
	useEffect(() => {
		console.log(`🔌 Global Socket init: Connecting to ${gatewayConfig.url}`);

		const newSocket = io(gatewayConfig.url, {
			path: gatewayConfig.path,
			withCredentials: true,
			transports: ['websocket'],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
		});

		newSocket.on('connect', () => {
			console.log('✅ Global Socket Connected');
			setIsConnected(true);
		});

		newSocket.on('disconnect', (reason) => {
			console.warn('❌ Global Socket Disconnected:', reason);
			if (reason !== "io client disconnect") {
				setIsConnected(false);
			}
		});

		newSocket.on('connect_error', (err) => {
			// Au F5, ceci peut arriver brièvement, mais le timer l'absorbera
			console.error(`🔥 Connection Error:`, err.message);
			setIsConnected(false);
		});

		newSocket.on('exception', (error: any) => {
			console.error('⚠ Gateway Exception:', error);
			if (error?.status === 'error' || error?.message === 'Unauthorized' || error?.code === 503) {
				setIsConnected(false);
			}
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [gatewayConfig]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{/* On utilise maintenant l'état visuel temporisé */}
			{showErrorScreen && <ConnectionErrorView />}
			{children}
		</SocketContext.Provider>
	);
};
