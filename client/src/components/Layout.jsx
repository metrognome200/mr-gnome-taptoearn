import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTon } from '../contexts/TonContext';
import { useGameState } from '../contexts/GameStateContext';
import { Button } from './ui/Button';

const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link 
            to={to}
            className={`px-4 py-2 rounded-lg transition-colors
                ${isActive 
                    ? 'bg-gnome-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        >
            {children}
        </Link>
    );
};

export const Layout = ({ children }) => {
    const { connected, connectWallet, wallet } = useTon();
    const { gnomeBalance, level } = useGameState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <motion.img 
                                    src="/logo.png" 
                                    alt="Mr. Gnome" 
                                    className="h-8 w-8"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <span className="text-xl font-bold text-white">
                                    Mr. Gnome
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NavLink to="/">Game</NavLink>
                            <NavLink to="/mining">Mining</NavLink>
                            <NavLink to="/tasks">Tasks</NavLink>
                            <NavLink to="/airdrops">Airdrops</NavLink>
                            <NavLink to="/achievements">Achievements</NavLink>
                            <NavLink to="/leaderboard">Leaderboard</NavLink>
                        </div>

                        {/* User Info and Wallet */}
                        <div className="flex items-center space-x-4">
                            {connected ? (
                                <>
                                    <div className="hidden md:flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Balance</p>
                                            <p className="text-gnome-400 font-medium">
                                                {gnomeBalance} $GNOME
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Level</p>
                                            <p className="text-white font-medium">
                                                {level}
                                            </p>
                                        </div>
                                        <Link 
                                            to="/profile"
                                            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            {formatAddress(wallet)}
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <Button
                                    onClick={connectWallet}
                                    variant="primary"
                                >
                                    Connect Wallet
                                </Button>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                <svg 
                                    className="h-6 w-6" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4 6h16M4 12h16M4 18h16" 
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-gray-800 border-b border-gray-700"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link 
                                to="/"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Game
                            </Link>
                            <Link 
                                to="/mining"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Mining
                            </Link>
                            <Link 
                                to="/tasks"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Tasks
                            </Link>
                            <Link 
                                to="/airdrops"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Airdrops
                            </Link>
                            <Link 
                                to="/achievements"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Achievements
                            </Link>
                            <Link 
                                to="/leaderboard"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                                Leaderboard
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};