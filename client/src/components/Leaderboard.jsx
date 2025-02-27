// client/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useTonWallet } from '../services/tonWallet';
import { Card } from './ui/Card';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';

export const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [timeframe, setTimeframe] = useState('daily'); // daily, weekly, allTime
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { supabase } = useSupabase();
    const { wallet } = useTonWallet();

    useEffect(() => {
        loadLeaderboard();
    }, [timeframe]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('id, username, gnome_balance, tap_power')
                .order('gnome_balance', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLeaderboard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={loadLeaderboard} />;

    return (
        <Card title="Leaderboard" className="overflow-hidden">
            <div className="flex space-x-2 mb-4">
                {['daily', 'weekly', 'allTime'].map((period) => (
                    <button
                        key={period}
                        onClick={() => setTimeframe(period)}
                        className={`px-4 py-2 rounded-lg transition-colors
                            ${timeframe === period 
                                ? 'bg-gnome-500 text-white' 
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tap Power
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {leaderboard.map((player, index) => (
                            <tr 
                                key={player.id}
                                className={`${player.id === wallet?.address ? 'bg-gnome-900/30' : ''}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {index < 3 ? (
                                            <span className="text-xl">
                                                {['🥇', '🥈', '🥉'][index]}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                #{index + 1}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-white">
                                        {player.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gnome-400">
                                        {player.gnome_balance.toLocaleString()} $GNOME
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">
                                        {player.tap_power}x
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};