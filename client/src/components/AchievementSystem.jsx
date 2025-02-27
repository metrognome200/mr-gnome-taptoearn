// client/src/components/AchievementSystem.jsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useTonWallet } from '../services/tonWallet';
import { Card } from './ui/Card';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';

export const AchievementSystem = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { supabase } = useSupabase();
    const { wallet } = useTonWallet();

    useEffect(() => {
        if (wallet) {
            loadAchievements();
        }
    }, [wallet]);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('achievements')
                .select(`
                    *,
                    user_achievements!inner(
                        completed,
                        completed_at,
                        progress
                    )
                `)
                .eq('user_achievements.user_id', wallet.address);

            if (error) throw error;
            setAchievements(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={loadAchievements} />;

    return (
        <Card title="Achievements" className="achievement-grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <div 
                        key={achievement.id}
                        className={`relative overflow-hidden rounded-lg p-4 transition-all duration-300 transform hover:scale-105
                            ${achievement.user_achievements[0]?.completed 
                                ? 'bg-gnome-900/50 border-2 border-gnome-500' 
                                : 'bg-gray-700'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center
                                    ${achievement.user_achievements[0]?.completed 
                                        ? 'bg-gnome-500' 
                                        : 'bg-gray-600'}`}>
                                    <span className="text-2xl">{achievement.icon}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {achievement.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block text-gnome-500">
                                            {achievement.user_achievements[0]?.progress || 0}%
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-gray-400">
                                            {achievement.target}
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-600">
                                    <div
                                        style={{ width: `${achievement.user_achievements[0]?.progress || 0}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gnome-500 transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};