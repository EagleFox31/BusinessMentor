
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OnboardingWorkflow from './components/OnboardingWorkflow';
import HexGridBackground from './components/HexGridBackground';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard'>('landing');
  const [user, setUser] = useState<Partial<UserProfile> | null>(null);

  const handleStart = () => setView('login');
  const handlePartialLogin = (partialUser: Partial<UserProfile>) => {
    setUser(partialUser);
    setView('onboarding');
  };
  const handleOnboardingComplete = (fullProfile: UserProfile) => {
    setUser(fullProfile);
    setView('dashboard');
  };
  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-apex-400 selection:text-abyss bg-transparent">
      {/* La grille est en z-index 0 */}
      <HexGridBackground />
      
      {/* Le contenu est en z-index 10 pour flotter par dessus la grille */}
      <div className="relative z-10 w-full min-h-screen bg-transparent">
        {view === 'landing' && <LandingPage onStart={handleStart} />}
        {view === 'login' && <LoginPage onLogin={handlePartialLogin} />}
        {view === 'onboarding' && user && (
          <OnboardingWorkflow 
            initialData={user} 
            onComplete={handleOnboardingComplete} 
          />
        )}
        {view === 'dashboard' && user && (
          <Dashboard user={user as UserProfile} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
};

export default App;
