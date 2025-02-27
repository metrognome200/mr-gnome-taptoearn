import React from 'react';
import { useMining } from '../hooks/useMining';

export const MiningSystem = () => {
    const { 
        miningCards, 
        totalProfit, 
        upgradeMiningCard, 
        collectMiningRewards 
    } = useMining();

    return (
        <div className="mining-container">
            <h2>Mining System</h2>
            <div className="total-profit">
                Profit per hour: {totalProfit} $GNOME
            </div>
            
            <div className="mining-cards">
                {miningCards.map(card => (
                    <div key={card.id} className="mining-card">
                        <h3>Mining Card Level {card.level}</h3>
                        <p>Profit: {card.profitPerHour}/hr</p>
                        <button onClick={() => upgradeMiningCard(card.id)}>
                            Upgrade ({card.upgradeCost} $GNOME)
                        </button>
                    </div>
                ))}
            </div>

            <button 
                className="collect-rewards"
                onClick={collectMiningRewards}
            >
                Collect Mining Rewards
            </button>
        </div>
    );
};