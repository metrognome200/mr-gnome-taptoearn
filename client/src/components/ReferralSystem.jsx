// client/src/components/ReferralSystem.jsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useTonWallet } from '../services/tonWallet';

export const ReferralSystem = () => {
    const [referralCode, setReferralCode] = useState('');
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarned: 0
    });
    const { supabase } = useSupabase();
    const { wallet } = useTonWallet();

    useEffect(() => {
        if (wallet) {
            loadReferralData();
        }
    }, [wallet]);

    const loadReferralData = async () => {
        // Load user's referral code
        const { data: userData } = await supabase
            .from('users')
            .select('referral_code')
            .eq('wallet_address', wallet.address)
            .single();

        if (userData) {
            setReferralCode(userData.referral_code);
        }

        // Load referral statistics
        const { data: referrals } = await supabase
            .from('users')
            .select('*')
            .eq('referred_by', wallet.address);

        if (referrals) {
            setReferralStats({
                totalReferrals: referrals.length,
                activeReferrals: referrals.filter(r => r.last_active > Date.now() - 7*24*60*60*1000).length,
                totalEarned: referrals.reduce((acc, r) => acc + r.referral_earnings, 0)
            });
        }
    };

    const copyReferralLink = () => {
        const referralLink = `https://t.me/MrGnomeBot?start=${referralCode}`;
        navigator.clipboard.writeText(referralLink);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Invite Friends & Earn Together
                </h2>
                <p className="text-gray-400">
                    Earn 10% of your referrals' earnings forever!
                </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        value={`https://t.me/MrGnomeBot?start=${referralCode}`}
                        readOnly
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg flex-1 mr-4"
                    />
                    <button
                        onClick={copyReferralLink}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Copy Link
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-1">Total Referrals</p>
                    <p className="text-2xl font-bold text-white">
                        {referralStats.totalReferrals}
                    </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-1">Active Referrals</p>
                    <p className="text-2xl font-bold text-white">
                        {referralStats.activeReferrals}
                    </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-green-400">
                        {referralStats.totalEarned} $GNOME
                    </p>
                </div>
            </div>
        </div>
    );
};