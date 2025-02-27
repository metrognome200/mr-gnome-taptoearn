// client/src/App.jsx
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Game } from './components/Game';
import { MiningSystem } from './components/MiningSystem';
import { TaskSystem } from './components/TaskSystem';
import { ReferralSystem } from './components/ReferralSystem';
import { AirdropSystem } from './components/AirdropSystem';
import { AchievementSystem } from './components/AchievementSystem';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { TonProvider } from './contexts/TonContext';
import { GameStateProvider } from './contexts/GameStateContext';
import { SocketProvider } from './contexts/SocketContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <TonProvider>
          <GameStateProvider>
            <SocketProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Game />} />
                    <Route path="/mining" element={<MiningSystem />} />
                    <Route path="/tasks" element={<TaskSystem />} />
                    <Route path="/referral" element={<ReferralSystem />} />
                    <Route path="/airdrops" element={<AirdropSystem />} />
                    <Route path="/achievements" element={<AchievementSystem />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </Layout>
              </Router>
            </SocketProvider>
          </GameStateProvider>
        </TonProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
};