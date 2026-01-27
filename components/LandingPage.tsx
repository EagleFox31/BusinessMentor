
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Eye, Target, Play } from 'lucide-react';
import { ApexLogo } from './Logo';

interface LandingPageProps {
  onStart: () => void;
  onResume?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onResume }) => {
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('apex_local_user');
    const admin = localStorage.getItem('apex_admin_user');
    if (local || admin) {
      setHasExistingSession(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans overflow-x-hidden flex flex-col">
      
      {/* Navbar Stylisée */}
      <nav className="fixed w-full z-50 glass-apex border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <ApexLogo className="w-8 h-8" />
               <span className="font-display font-bold text-2xl tracking-tighter text-white uppercase">APEX HORUS</span>
            </div>
            <div className="trigenys-signature mt-1 flex items-center gap-2">
              <span className="font-signature text-2xl text-sky-400/80 italic lowercase tracking-normal -mt-1">by</span>
              Trigenys Group
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasExistingSession && (
              <button 
                onClick={onResume}
                className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full border border-sky-400/30 text-sky-400 font-black text-[10px] uppercase tracking-widest hover:bg-sky-400/10 transition-all"
              >
                Reprendre Session
              </button>
            )}
            <button 
              onClick={onStart}
              className="group px-8 py-3 rounded-full bg-apex-400 text-abyss font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-apex-500/20 flex items-center gap-3"
            >
              Accès Pilote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-40 px-6 min-h-screen flex items-center">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-30 falcon-mask">
          <img 
            src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=2070&auto=format&fit=crop" 
            alt="Falcon Eye" 
            className="w-full h-full object-cover object-center scale-110"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass-apex border-sky-400/30 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-float">
            <span className="w-2 h-2 rounded-full bg-sky-400 apex-glow animate-pulse"></span>
            SYSTÈME DE PRÉDITION STRATÉGIQUE
          </div>
          
          <h1 className="text-6xl lg:text-9xl font-display font-bold tracking-tighter mb-10 leading-[0.85] text-white animate-fadeIn">
            MAITRISEZ <br/>
            <span className="text-gradient-stealth">L'ASCENSION.</span>
          </h1>
          
          <p className="max-w-xl text-xl text-slate-400 mb-14 leading-relaxed font-light">
            Déployez vos ailes sur les marchés mondiaux. La vision souveraine d'<span className="font-bold text-white italic">Apex Horus</span> transforme votre intuition en empire structuré.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 animate-fadeIn">
            <button 
              onClick={onStart}
              className="group px-12 py-6 bg-apex-400 text-abyss rounded-2xl font-black text-xl transition-all transform hover:scale-105 shadow-2xl shadow-apex-500/40 flex items-center gap-4"
            >
              INITIALISER MA VISION <ArrowRight className="w-6 h-6" />
            </button>
            {hasExistingSession ? (
              <button 
                onClick={onResume}
                className="group px-8 py-6 glass-apex text-white rounded-2xl font-bold flex items-center gap-4 border border-white/10 hover:border-sky-400 transition-all"
              >
                <Play className="w-6 h-6 text-sky-400 fill-sky-400" /> REPRENDRE LA MISSION
              </button>
            ) : (
              <div className="flex flex-col items-start">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Technologie Propriétaire</span>
                 <span className="font-signature text-3xl text-sky-400/90 italic">by Trigenys Group</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-transparent border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: Eye, 
                title: "Oeil d'Horus", 
                desc: "Analyse des angles morts et scan panoramique des opportunités locales avec une précision divine.",
                color: "text-sky-400"
              },
              { 
                icon: TrendingUp, 
                title: "Trajectoire Apex", 
                desc: "Simulations financières à haute altitude basées sur des modèles de croissance agressifs.",
                color: "text-cyan-400"
              },
              { 
                icon: ShieldCheck, 
                title: "Périmètre de Chasse", 
                desc: "Infrastructure juridique et conformité scellée par le Trigenys Group.",
                color: "text-slate-400"
              }
            ].map((feat, i) => (
              <div key={i} className="p-12 rounded-[3rem] glass-apex group hover:-translate-y-4 transition-all duration-700">
                <div className="w-20 h-20 bg-abyss/80 rounded-3xl flex items-center justify-center mb-10 border border-white/5 group-hover:border-sky-400/50 transition-all shadow-inner">
                  <feat.icon className={`w-10 h-10 ${feat.color} apex-glow`} />
                </div>
                <h3 className="text-3xl font-display font-bold mb-6 text-white uppercase tracking-tight">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-24 border-t border-white/5 text-center bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
           <ApexLogo className="w-[500px] h-[500px]" />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 relative z-10">
           <div className="trigenys-signature flex items-center gap-2">
             <span className="font-signature text-2xl text-sky-400/80 italic lowercase tracking-normal">by</span>
             Trigenys Group
           </div>
           <div className="flex items-center gap-4">
             <ApexLogo className="w-12 h-12" />
             <span className="font-display font-bold text-4xl text-slate-300 uppercase tracking-tighter">APEX HORUS</span>
           </div>
           <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.6em] mt-8">Excellence • Strategy • Power</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
