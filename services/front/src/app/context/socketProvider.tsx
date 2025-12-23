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
	const [isConnected, setIsConnected] = useState(true);
	const [showErrorScreen, setShowErrorScreen] = useState(false);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	useEffect(() => {
		if (isConnected) {
			if (debounceTimer.current)
				clearTimeout(debounceTimer.current);
			setShowErrorScreen(false);
		} else {
			if (debounceTimer.current)
				clearTimeout(debounceTimer.current);

			debounceTimer.current = setTimeout(() => {
				setShowErrorScreen(true);
			}, 1000);
		}

		return () => {
			if (debounceTimer.current)
				clearTimeout(debounceTimer.current);
		};
	}, [isConnected]);

	useEffect(() => {
		console.log(`Global Socket init: Connecting to ${gatewayConfig.url}`);

		const newSocket = io(gatewayConfig.url, {
			path: gatewayConfig.path,
			withCredentials: true,
			transports: ['websocket'],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
		});

		newSocket.on('connect', () => {
			console.log('Global Socket Connected');
			setIsConnected(true);
		});

		newSocket.on('disconnect', (reason) => {
			if (reason !== "io client disconnect")
				setIsConnected(false);
		});

		newSocket.on('connect_error', (err) => {
			setIsConnected(false);
		});

		newSocket.on('exception', (error: any) => {
			if (error?.status === 'error' || error?.message === 'Unauthorized' || error?.code === 503)
				setIsConnected(false);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [gatewayConfig]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{showErrorScreen && <ConnectionErrorView />}
			{children}
		</SocketContext.Provider>
	);
};
