
import React, { useState } from 'react';
import { PlayCircle, Zap, ArrowRight, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (partialUser: Partial<UserProfile>) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  
  const handleDemoLogin = () => {
    onLogin({
      name: 'Entrepreneur Apex',
      country: 'France',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onLogin({
        name,
        country: 'France'
      });
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col lg:flex-row font-sans text-slate-200">
      
      {/* Left Panel - Visual Power */}
      <div className="hidden lg:flex w-1/2 bg-transparent relative overflow-hidden items-center justify-center p-24 border-r border-white/5">
        <div className="absolute inset-0 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1470434151738-dc5f4474c239?q=80&w=2070&auto=format&fit=crop" 
            alt="Majestic Falcon" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/40 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-14 flex flex-col">
            <div className="flex items-center gap-4">
               <Zap className="text-apex-400 w-10 h-10 fill-current gold-glow" />
               <span className="font-display font-bold text-4xl tracking-tighter text-white uppercase">Apex Vision</span>
            </div>
            <div className="trigenys-signature mt-2 text-xs">by Trigenys Group</div>
          </div>
          <h2 className="text-7xl font-display font-bold mb-10 text-white leading-[0.85] tracking-tighter">
            Votre Vision, <br/>
            <span className="text-gradient-gold font-signature normal-case text-8xl">notre structure.</span>
          </h2>
          <p className="text-xl text-slate-500 mb-14 leading-relaxed font-light">
            Entrez dans le cockpit de <strong>Trigenys Group</strong>. L'analyse prédictive commence dès votre identification.
          </p>
          <div className="p-8 glass-apex rounded-[2.5rem] flex items-center gap-6">
             <div className="w-16 h-16 bg-apex-400 rounded-2xl flex items-center justify-center">
                <Shield className="text-abyss w-8 h-8" />
             </div>
             <div>
                <span className="block font-black text-white text-xs uppercase tracking-widest">Protocoles Apex v3</span>
                <span className="text-slate-500 font-medium">Infrastructure Sécurisée Trigenys</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 sm:p-32 bg-transparent">
        <div className="w-full max-w-md space-y-16">
          
          <div className="space-y-6">
             <div className="lg:hidden flex flex-col items-center mb-10">
                <Zap className="text-apex-400 w-12 h-12 mb-4 gold-glow" />
                <div className="trigenys-signature">by Trigenys Group</div>
             </div>
            <h1 className="text-5xl font-display font-bold text-white tracking-tight">Authentification</h1>
            <p className="text-slate-500 font-medium text-lg">Initialisation de la session pilote.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block ml-2">Code d'Identité Entrepreneur</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 rounded-3xl px-8 py-6 text-white placeholder-slate-800 focus:outline-none focus:border-apex-400/50 focus:ring-1 focus:ring-apex-400/50 transition-all text-xl font-bold backdrop-blur-sm"
                placeholder="Votre Nom / Alias"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-apex-400 text-abyss font-black py-6 rounded-3xl transition-all transform hover:scale-[1.02] shadow-2xl shadow-apex-500/30 flex items-center justify-center gap-4 text-xl uppercase tracking-widest"
            >
              DÉCOLLAGE IMMÉDIAT <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="px-6 bg-transparent text-slate-700">Canaux Sécurisés Trigenys</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <button
              onClick={handleDemoLogin}
              className="w-full glass-apex text-slate-300 font-bold py-5 rounded-2xl flex items-center justify-center gap-4 hover:text-apex-400 transition-all border border-white/10"
            >
              <PlayCircle className="w-6 h-6" />
              Initialiser Mode Simulation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
