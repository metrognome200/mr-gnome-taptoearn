import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';
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
    const { socket } = useSocket();

    const [gameState, setGameState] = useState({
        gnomeBalance: 0,
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
        if (user) {
            loadGameState();
        }
    }, [user]);

    const loadGameState = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    boosters(*),
                    mining_cards(*),
                    user_achievements(
                        achievement_id,
                        progress,
                        completed
                    ),
                    user_tasks(
                        task_id,
                        progress,
                        completed
                    )
                `)
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setGameState({
                gnomeBalance: data.gnome_balance || 0,
                tapPower: data.tap_power || 1,
                level: data.level || 1,
                experience: data.experience || 0,
                lastTap: data.last_tap,
                boosters: data.boosters || [],
                miningCards: data.mining_cards || [],
                achievements: data.user_achievements || [],
                tasks: data.user_tasks || []
            });
        } catch (error) {
            console.error('Error loading game state:', error);
        }
    };

    const tap = async () => {
        if (cooldown > 0) return;

        try {
            const now = new Date().toISOString();
            const reward = calculateTapReward();

            const { data, error } = await supabase
                .from('users')
                .update({
                    gnome_balance: gameState.gnomeBalance + reward,
                    last_tap: now,
                    experience: gameState.experience + 1
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setGameState(prev => ({
                ...prev,
                gnomeBalance: data.gnome_balance,
                experience: data.experience,
                lastTap: data.last_tap
            }));

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

            // Notify other clients
            socket?.emit('tap', { userId: user.id, reward });
        } catch (error) {
            console.error('Error processing tap:', error);
        }
    };

    const calculateTapReward = () => {
        let reward = gameState.tapPower;
        
        // Apply booster effects
        gameState.boosters.forEach(booster => {
            if (booster.active && booster.expires_at > new Date().toISOString()) {
                reward *= booster.multiplier;
            }
        });

        return reward;
    };

    return (
        <GameStateContext.Provider value={{
            gameState,
            cooldown,
            tap,
            loadGameState
        }}>
            {children}
        </GameStateContext.Provider>
    );
};
