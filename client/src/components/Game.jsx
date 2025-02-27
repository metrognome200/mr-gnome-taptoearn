import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../contexts/GameStateContext';
import { useTon } from '../contexts/TonContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const Game = () => {
    const { 
        gnomeBalance,
        tapPower,
        handleTap,
        cooldown,
        isCooldown,
        boosters,
        level,
        experience
    } = useGameState();
    
    const { wallet, connected, connectWallet } = useTon();

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const calculateLevelProgress = () => {
        const expNeeded = level * 1000;
        return (experience / expNeeded) * 100;
    };

    return (
        <div className="space-y-8">
            {/* Main Game Area */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Level {level}</p>
                        <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                            <div 
                                className="h-full bg-gnome-500 rounded-full transition-all duration-300"
                                style={{ width: `${calculateLevelProgress()}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center py-8">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="mb-6"
                    >
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {formatNumber(gnomeBalance)} $GNOME
                        </h1>
                        <p className="text-gray-400">
                            Tap Power: {tapPower}x
                        </p>
                    </motion.div>

                    {!connected ? (
                        <Button
                            onClick={connectWallet}
                            size="lg"
                            className="animate-pulse"
                        >
                            Connect Wallet to Start
                        </Button>
                    ) : (
                        <motion.button
                            onClick={handleTap}
                            disabled={isCooldown}
                            className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl
                                ${isCooldown 
                                    ? 'bg-gray-700 cursor-not-allowed' 
                                    : 'bg-gnome-500 hover:bg-gnome-600'}`}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            {isCooldown ? cooldown : 'TAP!'}
                        </motion.button>
                    )}
                </div>

                {/* Active Boosters */}
                <AnimatePresence>
                    {boosters.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-8 pt-8 border-t border-gray-700"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Active Boosters
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {boosters.map((booster) => (
                                    <div 
                                        key={booster.id}
                                        className="bg-gray-700 rounded-lg p-4"
                                    >
                                        <p className="text-gnome-400 font-medium">
                                            {booster.multiplier}x Multiplier
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Expires in {booster.duration}s
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};