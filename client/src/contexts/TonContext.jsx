import React, { createContext, useContext, useState, useEffect } from 'react';
import TonWeb from 'tonweb';

const TonContext = createContext();

export const useTon = () => {
    const context = useContext(TonContext);
    if (!context) {
        throw new Error('useTon must be used within a TonProvider');
    }
    return context;
};

export const TonProvider = ({ children }) => {
    const [tonweb, setTonweb] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initTon = async () => {
            try {
                // Initialize TonWeb
                const provider = new TonWeb.HttpProvider(process.env.REACT_APP_TON_ENDPOINT);
                const tw = new TonWeb(provider);
                setTonweb(tw);

                // Check if wallet is already connected
                if (window.ton && window.ton.isTonWallet) {
                    const walletAddress = await window.ton.send('ton_requestAccounts');
                    if (walletAddress.length > 0) {
                        setWallet(walletAddress[0]);
                        setConnected(true);
                    }
                }
            } catch (error) {
                console.error('Error initializing TON:', error);
            } finally {
                setLoading(false);
            }
        };

        initTon();
    }, []);

    const connectWallet = async () => {
        try {
            if (!window.ton || !window.ton.isTonWallet) {
                window.open('https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd', '_blank');
                return;
            }

            const walletAddress = await window.ton.send('ton_requestAccounts');
            if (walletAddress.length > 0) {
                setWallet(walletAddress[0]);
                setConnected(true);
                return walletAddress[0];
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    };

    const disconnectWallet = () => {
        setWallet(null);
        setConnected(false);
    };

    const sendTransaction = async (to, amount, payload = '') => {
        if (!connected || !wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const result = await window.ton.send(
                'ton_sendTransaction',
                [{
                    to,
                    value: amount,
                    data: payload
                }]
            );
            return result;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    };

    const value = {
        tonweb,
        wallet,
        connected,
        loading,
        connectWallet,
        disconnectWallet,
        sendTransaction
    };

    return (
        <TonContext.Provider value={value}>
            {children}
        </TonContext.Provider>
    );
};
