
import React, { useState } from 'react';
import { PlayCircle, ArrowRight, Shield, Loader2, Mail, Lock, AlertTriangle, Key, ChevronLeft, UserPlus, LogIn, AtSign, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { ApexLogo } from './Logo';

interface LoginPageProps {
  onLogin: (partialUser: any) => void;
  onLocalMode: (isAdmin?: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onLocalMode }) => {
  const [identifier, setIdentifier] = useState(''); // Email ou Username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAdminField, setShowAdminField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveEmailFromUsername = async (username: string): Promise<string | null> => {
    const cleanUsername = username.replace('@', '').trim().toLowerCase();
    const q = query(collection(db, "users"), where("username", "==", cleanUsername), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data().email;
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let emailToUse = identifier.trim();

      // Si l'identifiant ne ressemble pas à un email, on cherche par username
      if (!emailToUse.includes('@') || !emailToUse.includes('.')) {
        const resolved = await resolveEmailFromUsername(emailToUse);
        if (resolved) {
          emailToUse = resolved;
        } else if (!isRegistering) {
          throw new Error("Username introuvable.");
        }
      }

      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, emailToUse, password);
      } else {
        await signInWithEmailAndPassword(auth, emailToUse, password);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      if (err.message === "Username introuvable.") {
        setError("Aucun profil associé à ce @username.");
      } else {
        switch (err.code) {
          case 'auth/invalid-email':
            setError("Identifiant ou Email invalide.");
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError("Identifiants incorrects ou profil inexistant.");
            break;
          default:
            setError("Erreur d'accès : " + err.message);
        }
      }
    } finally { setIsLoading(false); }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '2025') {
      onLocalMode(true);
    } else {
      setError("Code Admin Invalide.");
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      setError("Passage en mode local Alpha...");
      onLocalMode(false);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col lg:flex-row font-sans text-slate-200">
      {/* Côté gauche - Branding */}
      <div className="hidden lg:flex w-1/2 bg-transparent relative items-center justify-center p-24 border-r border-white/5">
        <div className="absolute inset-0 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
          <img src="https://images.unsplash.com/photo-1470434151738-dc5f4474c239?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-14 flex items-center gap-4">
             <ApexLogo className="w-12 h-12" />
             <span className="font-display font-bold text-4xl tracking-tighter text-white uppercase">Apex Horus</span>
          </div>
          <h2 className="text-7xl font-display font-bold mb-10 text-white leading-none tracking-tighter">Votre Vision, <span className="text-gradient-stealth font-signature normal-case text-8xl">notre structure.</span></h2>
        </div>
      </div>

      {/* Côté droit - Formulaires */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-24 bg-transparent">
        <div className="w-full max-w-md space-y-10">
          
          <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <h1 className="text-4xl font-display font-bold text-white tracking-tight uppercase italic">
                  {showAdminField ? 'Admin' : isRegistering ? 'Nouveau Profil' : 'Accès'}
                </h1>
                <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mt-1">
                  {isRegistering ? 'Initialisation' : 'Login via @Username ou Email'}
                </p>
             </div>
             {showAdminField && (
               <button onClick={() => setShowAdminField(false)} className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-1 hover:text-white transition-all">
                 <ChevronLeft className="w-3 h-3" /> Retour
               </button>
             )}
          </div>

          {!showAdminField ? (
            <div className="space-y-8">
              <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-sky-500 text-abyss shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <LogIn className="w-3 h-3" /> Connexion
                </button>
                <button 
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-sky-500 text-abyss shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <UserPlus className="w-3 h-3" /> Inscription
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex gap-2 text-slate-600 group-focus-within:text-sky-400 transition-colors">
                      <AtSign className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={identifier} 
                      onChange={(e) => setIdentifier(e.target.value)} 
                      className="w-full bg-slate-900/60 border border-white/10 rounded-3xl p-6 pl-14 text-white outline-none focus:border-sky-400/50 transition-all placeholder:text-slate-700" 
                      placeholder={isRegistering ? "Email de mission" : "@username ou email"} 
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-slate-900/60 border border-white/10 rounded-3xl p-6 pl-14 pr-14 text-white outline-none focus:border-sky-400/50 transition-all" 
                      placeholder="Mot de passe" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-sky-400 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-sky-400 text-abyss font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-widest hover:bg-white shadow-xl shadow-sky-500/10 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isRegistering ? 'INITIALISER' : 'DÉCOLLAGE'} 
                  {!isLoading && <ArrowRight className="w-6 h-6" />}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleAdminAuth} className="space-y-6 animate-fadeIn">
              <input 
                type="text" 
                autoFocus
                required
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)} 
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amber-400 text-center text-4xl font-display tracking-[0.5em]" 
                placeholder="0000" 
              />
              <button type="submit" className="w-full bg-amber-400 text-abyss font-black py-6 rounded-3xl text-xl uppercase tracking-widest shadow-2xl shadow-amber-500/20 hover:bg-white transition-all">
                DÉBLOQUER
              </button>
            </form>
          )}

          {error && (
            <div className="flex items-start gap-3 text-red-400 text-sm font-bold bg-red-400/10 p-5 rounded-2xl animate-shake border border-red-400/20">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!showAdminField && (
            <div className="grid grid-cols-1 gap-4 pt-6">
              <button onClick={handleDemoLogin} className="w-full glass-apex text-slate-300 font-bold py-5 rounded-2xl flex items-center justify-center gap-4 hover:text-sky-400 transition-all border border-white/10">
                <PlayCircle className="w-5 h-5" /> Mode Exploration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
