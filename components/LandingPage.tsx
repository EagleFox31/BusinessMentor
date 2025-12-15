import React from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Users, BrainCircuit } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">BusinessMentor<span className="text-emerald-500">GPT</span></div>
          <button 
            onClick={onStart}
            className="px-6 py-2 rounded-full bg-white text-[#0f172a] font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Connexion
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Intelligence Artificielle Stratégique
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight premium-gradient-text animate-fade-in-up" style={{animationDelay: '100ms'}}>
            Transformez votre intuition <br/> en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">empire durable.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12 leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
            Plus qu'un outil, un mentor. Structurez votre idée, validez votre marché et simulez vos finances avec la voix de la raison entrepreneuriale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/40 flex items-center gap-2"
            >
              Commencer l'immersion <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-lg transition-all border border-slate-700">
              Voir la démo
            </button>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#020617] border-t border-slate-800 flex-1">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Analyse Impartiale</h3>
              <p className="text-slate-400 leading-relaxed">
                Un regard froid et logique sur votre business model. Pas de complaisance, uniquement des faits et des stratégies éprouvées.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Simulation Financière</h3>
              <p className="text-slate-400 leading-relaxed">
                Projetez votre trésorerie et votre ROI à 6, 12 et 24 mois. Anticipez les creux de vague avant qu'ils n'arrivent.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Architecture Légale</h3>
              <p className="text-slate-400 leading-relaxed">
                Des recommandations adaptées à la réglementation de votre pays. Statuts, pactes d'associés, conformité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
           <span className="text-xs text-slate-600 mb-1">&copy; {new Date().getFullYear()}</span>
           <div className="flex items-center gap-2 text-lg">
             <span className="font-medium text-slate-400">BusinessMentor</span>
             <span className="font-['Pinyon_Script'] text-2xl text-emerald-500/80 italic mt-1">by</span>
             <span className="font-bold tracking-[0.2em] text-sm uppercase text-slate-300">TRIGENYS GROUP</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;