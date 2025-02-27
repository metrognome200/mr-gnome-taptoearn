import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useTon } from './TonContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { wallet } = useTon();

    useEffect(() => {
        if (wallet) {
            // Initialize socket connection
            const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
                query: { userId: wallet }
            });

            // Socket event listeners
            newSocket.on('connect', () => {
                console.log('Socket connected');
                newSocket.emit('join-user-room', wallet);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            newSocket.on('user-tap', ({ userId, reward }) => {
                if (userId !== wallet) {
                    // Handle other user's tap event
                    console.log(`User ${userId} tapped for ${reward} GNOME`);
                }
            });

            newSocket.on('mining-reward', ({ userId, reward }) => {
                if (userId === wallet) {
                    // Handle mining reward
                    console.log(`Received mining reward: ${reward} GNOME`);
                }
            });

            newSocket.on('airdrop-claimed', ({ userId, amount }) => {
                // Handle airdrop claim notification
                console.log(`User ${userId} claimed ${amount} tokens`);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                newSocket.close();
            };
        }
    }, [wallet]);

    const value = {
        socket,
        connected: socket?.connected || false
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
