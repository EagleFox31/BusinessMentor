import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OnboardingWorkflow from './components/OnboardingWorkflow';
import { UserProfile } from './types';

const App: React.FC = () => {
  // Routing State: Landing -> Login -> Onboarding -> Dashboard
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard'>('landing');
  const [user, setUser] = useState<Partial<UserProfile> | null>(null);

  const handleStart = () => {
    setView('login');
  };

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
    <>
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
    </>
  );
};

export default App;