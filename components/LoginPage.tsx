
import React, { useState } from 'react';
import { PlayCircle, ArrowRight, Shield, Loader2, Mail, Lock } from 'lucide-react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { ApexLogo } from './Logo';

interface LoginPageProps {
  onLogin: (partialUser: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError("Erreur d'authentification. Vérifiez vos accès.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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
               <ApexLogo className="w-12 h-12" />
               <span className="font-display font-bold text-4xl tracking-tighter text-white uppercase">Apex Horus</span>
            </div>
            <div className="trigenys-signature mt-2 text-xs flex items-center gap-2">
              <span className="font-signature text-2xl text-sky-400/80 italic lowercase tracking-normal">by</span>
              Trigenys Group
            </div>
          </div>
          <h2 className="text-7xl font-display font-bold mb-10 text-white leading-[0.85] tracking-tighter">
            Votre Vision, <br/>
            <span className="text-gradient-stealth font-signature normal-case text-8xl">notre structure.</span>
          </h2>
          <p className="text-xl text-slate-500 mb-14 leading-relaxed font-light">
            Entrez dans le cockpit de <strong className="text-white">Trigenys Group</strong>. L'oeil d'<strong className="text-white">Horus</strong> analyse votre projet via Firebase Secure.
          </p>
          <div className="p-8 glass-apex rounded-[2.5rem] flex items-center gap-6">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                <Shield className="text-sky-400 w-8 h-8" />
             </div>
             <div>
                <span className="block font-black text-white text-xs uppercase tracking-widest">Protocoles Cloud v11</span>
                <span className="text-slate-500 font-medium">Infrastructure Sécurisée Trigenys</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 sm:p-32 bg-transparent">
        <div className="w-full max-w-md space-y-12">
          
          <div className="space-y-6">
             <div className="lg:hidden flex flex-col items-center mb-10">
                <ApexLogo className="w-16 h-16 mb-4" />
                <div className="trigenys-signature flex items-center gap-2">
                  <span className="font-signature text-2xl text-sky-400/80 italic lowercase tracking-normal">by</span>
                  Trigenys Group
                </div>
             </div>
            <h1 className="text-5xl font-display font-bold text-white tracking-tight">Authentification</h1>
            <p className="text-slate-500 font-medium text-lg">
              {isRegistering ? "Créez votre identifiant pilote." : "Initialisation de la session pilote."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/40 border border-white/10 rounded-3xl pl-16 pr-8 py-6 text-white placeholder-slate-700 focus:outline-none focus:border-apex-400/50 transition-all text-lg font-bold backdrop-blur-sm"
                  placeholder="Email Stratégique"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/40 border border-white/10 rounded-3xl pl-16 pr-8 py-6 text-white placeholder-slate-700 focus:outline-none focus:border-apex-400/50 transition-all text-lg font-bold backdrop-blur-sm"
                  placeholder="Clé d'Accès"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-bold ml-2 px-4 py-2 bg-red-400/10 border border-red-400/20 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-apex-400 text-abyss font-black py-6 rounded-3xl transition-all transform hover:scale-[1.02] shadow-2xl shadow-apex-500/30 flex items-center justify-center gap-4 text-xl uppercase tracking-widest disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                <> {isRegistering ? "CRÉER L'ACCÈS" : "DÉCOLLAGE"} <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-center text-slate-600 font-bold hover:text-sky-400 transition-colors text-sm uppercase tracking-widest"
            >
              {isRegistering ? "J'ai déjà un compte Apex" : "Nouvel Agent ? S'enregistrer"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="px-6 bg-[#020617] text-slate-700">Canaux Sécurisés Cloud</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full glass-apex text-slate-300 font-bold py-5 rounded-2xl flex items-center justify-center gap-4 hover:text-apex-400 transition-all border border-white/10"
          >
            <PlayCircle className="w-6 h-6" />
            Accès Invité (Mode Alpha)
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
