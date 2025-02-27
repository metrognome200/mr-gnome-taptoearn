import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';
import { useTon } from './TonContext';
import { useSocket } from './SocketContext';

const GameStateContext = createContext();

export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
};

export const GameStateProvider = ({ children }) => {
    const { supabase, user } = useSupabase();
    const { wallet } = useTon();
    const { socket } = useSocket();

    const [gameState, setGameState] = useState({
        gnomeBalance: 0,
        tonBalance: 0,
        tapPower: 1,
        level: 1,
        experience: 0,
        lastTap: null,
        boosters: [],
        miningCards: [],
        achievements: [],
        tasks: []
    });

    const [cooldown, setCooldown] = useState(0);
    const TAP_COOLDOWN = 5; // seconds

    useEffect(() => {
        if (wallet) {
            loadGameState();
        }
    }, [wallet]);

    const loadGameState = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    boosters(*),
                    mining_cards(*),
                    user_achievements(
                        *,
                        achievements(*)
                    ),
                    user_tasks(
                        *,
                        tasks(*)
                    )
                `)
                .eq('wallet_address', wallet)
                .single();

            if (error) throw error;

            setGameState({
                gnomeBalance: data.gnome_balance,
                tonBalance: data.ton_balance,
                tapPower: data.tap_power,
                level: data.level,
                experience: data.experience,
                lastTap: data.last_tap,
                boosters: data.boosters,
                miningCards: data.mining_cards,
                achievements: data.user_achievements,
                tasks: data.user_tasks
            });
        } catch (error) {
            console.error('Error loading game state:', error);
        }
    };

    const handleTap = async () => {
        if (cooldown > 0 || !wallet) return;

        try {
            const reward = calculateTapReward();
            
            const { data, error } = await supabase
                .from('users')
                .update({
                    gnome_balance: gameState.gnomeBalance + reward,
                    last_tap: new Date().toISOString()
                })
                .eq('wallet_address', wallet)
                .select()
                .single();

            if (error) throw error;

            setGameState(prev => ({
                ...prev,
                gnomeBalance: data.gnome_balance,
                lastTap: data.last_tap
            }));

            startCooldown();

            // Emit tap event to update other clients
            socket?.emit('user-tap', {
                userId: wallet,
                reward
            });
        } catch (error) {
            console.error('Error handling tap:', error);
        }
    };

    const calculateTapReward = () => {
        let reward = gameState.tapPower;

        // Apply active boosters
        gameState.boosters.forEach(booster => {
            if (new Date(booster.expires_at) > new Date()) {
                reward *= booster.multiplier;
            }
        });

        return reward;
    };

    const startCooldown = () => {
        setCooldown(TAP_COOLDOWN);
        const timer = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const value = {
        ...gameState,
        handleTap,
        cooldown,
        isCooldown: cooldown > 0,
        loadGameState
    };

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
};
