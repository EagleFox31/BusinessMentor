import React, { useState } from 'react';
import { PlayCircle, Globe, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (partialUser: Partial<UserProfile>) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  
  const handleDemoLogin = () => {
    onLogin({
      name: 'Alexandre Dupont',
      country: 'France', // Default fallback
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onLogin({
        name,
        country: 'France' // Will be confirmed in Onboarding
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col lg:flex-row font-sans text-slate-200">
      
      {/* Left Panel - Hero/Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406140926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-lg text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 opacity-80">
            <span className="font-medium text-white tracking-widest">BusinessMentor</span>
            <span className="font-['Pinyon_Script'] text-3xl text-emerald-500 italic mt-1">by</span>
            <span className="font-bold tracking-[0.2em] text-sm uppercase text-slate-300">TRIGENYS GROUP</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 text-white leading-tight font-display">L'Empire commence par une vision.</h2>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed font-light">
            Connectez-vous pour structurer votre ambition.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0f172a]">
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Identification</h1>
            <p className="text-slate-400">Accédez à votre espace sécurisé.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Comment devons-nous vous appeler ?</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Votre Prénom"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0f172a] text-slate-600">Options d'accès</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              className="w-full bg-white text-slate-900 font-medium py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors"
              onClick={() => { /* Mock Google Login */ setTimeout(() => handleDemoLogin(), 500); }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Connexion Google
            </button>
            <button
              onClick={handleDemoLogin}
              className="w-full bg-slate-800/50 text-slate-400 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
            >
              <PlayCircle className="w-5 h-5" />
              Démo Invité
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;