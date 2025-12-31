
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OnboardingWorkflow from './components/OnboardingWorkflow';
import HexGridBackground from './components/HexGridBackground';
import { UserProfile } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard' | 'loading'>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // L'utilisateur est connecté, on cherche son profil dans Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserProfile);
          setView('dashboard');
        } else {
          // L'utilisateur est connecté mais n'a pas fini l'onboarding
          setUser({
            name: firebaseUser.displayName || 'Entrepreneur',
            email: firebaseUser.email || '',
            country: 'France' // Défaut
          } as UserProfile);
          setView('onboarding');
        }
      } else {
        setView('landing');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStart = () => setView('login');
  
  const handleOnboardingComplete = async (fullProfile: UserProfile) => {
    if (!auth.currentUser) return;
    
    // Sauvegarde du profil complet dans Firestore
    await setDoc(doc(db, "users", auth.currentUser.uid), fullProfile);
    setUser(fullProfile);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('landing');
  };

  if (view === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-abyss">
        <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-apex-400 selection:text-abyss bg-transparent">
      <HexGridBackground />
      
      <div className="relative z-10 w-full min-h-screen bg-transparent">
        {view === 'landing' && <LandingPage onStart={handleStart} />}
        {view === 'login' && <LoginPage onLogin={() => {}} />}
        {view === 'onboarding' && user && (
          <OnboardingWorkflow 
            initialData={user} 
            onComplete={handleOnboardingComplete} 
          />
        )}
        {view === 'dashboard' && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
};

export default App;
