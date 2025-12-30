
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  BarChart2, 
  LogOut, 
  Target, 
  TrendingUp, 
  Globe, 
  ArrowRight, 
  Shield, 
  Zap, 
  Eye 
} from 'lucide-react';
import { UserProfile, ChatMessage, PlanSection, PlanData } from '../types';
import ChatInterface from './ChatInterface';
import SimulationCharts from './SimulationCharts';
import PlanView from './PlanView';
import { initializeChat, sendMessageToMentor, distillPlanFromHistory } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

type TabType = 'pilotage' | 'mentor' | 'studio' | 'simulation';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pilotage');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePlanSection, setActivePlanSection] = useState<PlanSection>(PlanSection.IDEA_VALIDATION);
  const [planData, setPlanData] = useState<Partial<PlanData>>({});

  useEffect(() => {
    const startSession = async () => {
      setIsLoading(true);
      try {
        await initializeChat(user);
        setMessages([{
          id: 'init',
          role: 'model',
          text: `Opérateur **${user.name}**, le Faucon a verrouillé les coordonnées sur **${user.country}**. \n\nSystèmes **Trigenys v4.0** en ligne. Prêt pour l'acquisition d'objectifs stratégiques.`,
          timestamp: new Date()
        }]);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    startSession();
  }, [user]);

  useEffect(() => {
    const syncPlan = async () => {
      if (messages.length < 2 || isSyncing) return;
      const last = messages[messages.length - 1];
      if (last.role === 'user') return;
      setIsSyncing(true);
      try {
        const distilled = await distillPlanFromHistory(messages, user);
        setPlanData(prev => ({ ...prev, ...distilled }));
      } catch (e) { console.error(e); } finally { setIsSyncing(false); }
    };
    const t = setTimeout(syncPlan, 1500);
    return () => clearTimeout(t);
  }, [messages, user]);

  const handleSendMessage = async (text: string) => {
    const uMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, uMsg]);
    setIsLoading(true);
    try {
      const res = await sendMessageToMentor(text);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: res, timestamp: new Date() }]);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleWorkflowClick = (section: PlanSection) => {
    setActivePlanSection(section);
    setActiveTab('mentor');
    handleSendMessage(`Analyse de palier : "${section}". Extraction des données de mission.`);
  };

  const roadmapSteps = [
    { section: PlanSection.IDEA_VALIDATION, icon: Eye, color: "text-sky-400", desc: "Clarté du concept tactique." },
    { section: PlanSection.MARKET_STUDY, icon: Globe, color: "text-cyan-400", desc: "Scan du périmètre concurrentiel." },
    { section: PlanSection.BUSINESS_MODEL, icon: Zap, color: "text-blue-400", desc: "Moteur de capture de valeur." },
    { section: PlanSection.LEGAL, icon: Shield, color: "text-slate-400", desc: "Blindage juridique." },
    { section: PlanSection.FINANCIALS, icon: TrendingUp, color: "text-emerald-400", desc: "Vitesse ascensionnelle." },
    { section: PlanSection.GROWTH, icon: Target, color: "text-rose-400", desc: "Cible d'impact marketing." },
  ];

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden font-sans bg-transparent">
      
      {/* Sidebar Stylisée Trigenys (Cyber Blue) */}
      <aside className="w-28 lg:w-80 bg-slate-950/60 backdrop-blur-xl border-r border-sky-900/30 flex flex-col py-10 px-6">
        <div className="mb-16 flex flex-col items-center lg:items-start lg:pl-4">
           <Zap className="text-sky-400 w-12 h-12 fill-current apex-glow mb-4" />
           <div className="hidden lg:flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tighter text-white uppercase">APEX VISION</span>
              <div className="trigenys-signature text-[8px] mt-1 text-sky-500/60">by Trigenys Group</div>
           </div>
        </div>
        
        <nav className="flex-1 space-y-4">
          {[
            { id: 'pilotage', label: 'Tactique', icon: LayoutDashboard },
            { id: 'mentor', label: 'Comm-Link', icon: MessageSquare },
            { id: 'studio', label: 'Blueprints', icon: FileText },
            { id: 'simulation', label: 'Sim-Deck', icon: BarChart2 }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-5 rounded-[1.2rem] transition-all duration-300 ${
                activeTab === item.id ? 'bg-sky-500/10 text-sky-400 border border-sky-400/20 shadow-lg shadow-sky-500/10' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'apex-glow' : ''}`} />
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.25em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-10 border-t border-sky-900/30 flex flex-col gap-6">
           <div className="hidden lg:flex flex-col gap-1 pl-4">
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active Agent</span>
              <span className="text-xs font-bold text-slate-400">{user.name}</span>
           </div>
           <button onClick={onLogout} className="flex items-center gap-4 p-5 text-slate-700 hover:text-red-500 transition-colors rounded-2xl">
             <LogOut className="w-6 h-6" />
             <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Abort</span>
           </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 relative overflow-hidden bg-transparent">
        {activeTab === 'pilotage' && (
          <div className="p-12 h-full overflow-y-auto space-y-16 animate-fadeIn">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
               <div className="space-y-4">
                  <div className="trigenys-signature text-sky-500/40">HUD VERSION 4.2.1 // GLOBAL INFRASTRUCTURE</div>
                  <h1 className="text-6xl font-display font-bold text-white tracking-tighter">
                    Mission <span className="text-gradient-stealth italic font-signature lowercase text-7xl">Control</span>
                  </h1>
               </div>
               <div className="glass-apex px-10 py-6 rounded-[2rem] border-sky-500/20 text-center">
                  <span className="block text-[9px] text-sky-500/60 uppercase tracking-[0.4em] font-black mb-2">Completion Altitude</span>
                  <span className="text-4xl font-display font-bold text-sky-400 apex-glow">
                    {Math.round(Object.values(planData).reduce((acc, curr) => acc + (curr?.completion || 0), 0) / 6)}%
                  </span>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {roadmapSteps.map((step, idx) => {
                const progress = planData[step.section]?.completion || 0;
                return (
                  <button 
                    key={step.section}
                    onClick={() => handleWorkflowClick(step.section)}
                    className="group p-10 rounded-[2.5rem] glass-apex transition-all duration-500 text-left hover:-translate-y-3 hover:border-sky-500/40"
                  >
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-sky-500/10 group-hover:border-sky-500/50 transition-all">
                          <step.icon className={`w-8 h-8 ${progress > 0 ? step.color : 'text-slate-700'} group-hover:apex-glow`} />
                       </div>
                       <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Séquence {idx+1}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-sky-400 transition-colors uppercase tracking-tight">{step.section}</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 uppercase tracking-wide">{step.desc}</p>
                    
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 apex-glow transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Lock Status</span>
                       <span className="text-[10px] font-bold text-sky-500">{Math.round(progress)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'mentor' && (
           <div className="h-full flex flex-col bg-transparent">
             <div className="h-24 border-b border-sky-900/20 flex items-center justify-between px-12 glass-apex">
                <div className="flex flex-col">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse apex-glow"></div>
                      <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white italic">Signal: <span className="text-sky-400">{activePlanSection}</span></h2>
                   </div>
                   <div className="trigenys-signature text-[7px] mt-1 opacity-50">Secure Communication Link</div>
                </div>
                {isSyncing && <div className="text-[9px] font-black text-sky-400 animate-pulse tracking-[0.4em] uppercase">Encrypting Blueprint...</div>}
             </div>
             <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
           </div>
        )}
        
        {activeTab === 'studio' && <div className="p-16 h-full overflow-y-auto max-w-6xl mx-auto"><PlanView activeSection={activePlanSection} planData={planData as any} /></div>}
        {activeTab === 'simulation' && <div className="p-16 h-full overflow-y-auto"><SimulationCharts user={user} /></div>}
      </main>
    </div>
  );
};

export default Dashboard;
