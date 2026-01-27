
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OnboardingWorkflow from './components/OnboardingWorkflow';
import ProjectSelector from './components/ProjectSelector';
import HexGridBackground from './components/HexGridBackground';
import { UserProfile, Project } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'project-selector' | 'onboarding' | 'dashboard' | 'loading'>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLocalMode(false);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let userData: UserProfile;
        if (userSnap.exists()) {
          userData = userSnap.data() as UserProfile;
        } else {
          userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Entrepreneur',
            email: firebaseUser.email || '',
            projectIds: [],
            username: `user_${firebaseUser.uid.slice(0, 5)}`
          };
          await setDoc(userRef, userData);
        }
        setUser(userData);
        setView('project-selector');
      } else if (!isLocalMode) {
        setView('landing');
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [isLocalMode]);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setView('dashboard');
  };

  const handleCreateNewProject = () => {
    setView('onboarding');
  };

  const handleLogout = async () => {
    if (!isLocalMode) await signOut(auth);
    setIsLocalMode(false);
    setUser(null);
    setCurrentProject(null);
    setView('landing');
  };

  if (view === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-abyss text-sky-400">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
           <span className="font-black text-[10px] uppercase tracking-widest animate-pulse">Séquence de boot Apex...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-apex-400 selection:text-abyss bg-transparent">
      <HexGridBackground />
      <div className="relative z-10 w-full min-h-screen bg-transparent">
        {view === 'landing' && <LandingPage onStart={() => setView('login')} onResume={() => setView('project-selector')} />}
        {view === 'login' && <LoginPage onLogin={() => {}} onLocalMode={() => { setIsLocalMode(true); setView('onboarding'); }} />}
        
        {view === 'project-selector' && user && (
          <ProjectSelector 
            user={user} 
            onSelect={handleProjectSelect} 
            onCreate={handleCreateNewProject} 
            onLogout={handleLogout}
          />
        )}

        {view === 'onboarding' && user && (
          <OnboardingWorkflow 
            user={user} 
            onComplete={(newProj) => { setCurrentProject(newProj); setView('dashboard'); }} 
          />
        )}

        {view === 'dashboard' && user && currentProject && (
          <Dashboard 
            user={user} 
            project={currentProject} 
            onLogout={handleLogout} 
            onProjectUpdate={(p) => setCurrentProject(p)}
            onUserUpdate={(u) => setUser(u)}
            onBackToProjects={() => setView('project-selector')}
          />
        )}
      </div>
    </div>
  );
};

export default App;
