import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useTonWallet } from '../services/tonWallet';

export const useGameState = () => {
    const [gnomeBalance, setGnomeBalance] = useState(0);
    const [tapPower, setTapPower] = useState(1);
    const [lastTap, setLastTap] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const { supabase } = useSupabase();
    const { connected, wallet } = useTonWallet();

    const TAP_COOLDOWN = 5; // seconds

    useEffect(() => {
        if (connected && wallet) {
            loadUserData();
        }
    }, [connected, wallet]);

    const loadUserData = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('gnome_balance, tap_power, last_tap')
            .eq('wallet_address', wallet.address)
            .single();

        if (data) {
            setGnomeBalance(data.gnome_balance);
            setTapPower(data.tap_power);
            setLastTap(data.last_tap);
        }
    };

    const handleTap = async () => {
        if (!connected || cooldown > 0) return;

        try {
            const reward = tapPower * (1 + calculateBoosters());
            
            const { data, error } = await supabase
                .from('users')
                .update({
                    gnome_balance: gnomeBalance + reward,
                    last_tap: new Date().toISOString()
                })
                .eq('wallet_address', wallet.address);

            if (!error) {
                setGnomeBalance(prev => prev + reward);
                setLastTap(new Date().toISOString());
                startCooldown();
            }
        } catch (error) {
            console.error('Tap failed:', error);
        }
    };

    const calculateBoosters = () => {
        // Calculate active boosters multiplier
        return 0; // Implement booster calculation
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

    return {
        gnomeBalance,
        tapPower,
        handleTap,
        cooldown,
        isCooldown: cooldown > 0,
    };
};