import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  BarChart2, 
  Download, 
  LogOut, 
  Menu,
  X,
  Target,
  Briefcase,
  Scale,
  Settings,
  TrendingUp,
  Globe,
  Map,
  Compass,
  ArrowRight,
  ChevronRight,
  Shield,
  Coins,
  Users
} from 'lucide-react';
import { UserProfile, ChatMessage, PlanSection, BusinessStage } from '../types';
import ChatInterface from './ChatInterface';
import SimulationCharts from './SimulationCharts';
import PlanView from './PlanView';
import { initializeChat, sendMessageToMentor } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

type TabType = 'pilotage' | 'mentor' | 'studio' | 'simulation';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pilotage');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePlanSection, setActivePlanSection] = useState<PlanSection>(PlanSection.IDEA_VALIDATION);

  // Initialize chat only once
  useEffect(() => {
    const startSession = async () => {
      setIsLoading(true);
      try {
        await initializeChat(user);
        const welcomeMsg = `Bonjour ${user.name}. \n\nNous structurons un projet **${user.businessType}** en **${user.country}**, devise **${user.currency}**. \n\nJe suis prêt. Quel est le premier point de tension ou l'objectif du jour ?`;
        setMessages([
          {
            id: 'init-1',
            role: 'model',
            text: welcomeMsg,
            timestamp: new Date()
          }
        ]);
      } catch (e) {
        console.error("Failed to init chat", e);
      } finally {
        setIsLoading(false);
      }
    };
    startSession();
  }, [user]);

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToMentor(text);
      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (action: string, context: string) => {
    setActiveTab('mentor');
    const prompt = `Je veux travailler sur le point suivant : **${action}**. \nContexte spécifique : ${context}. \n\nQuelles sont les premières étapes critiques pour mon business en ${user.country} ?`;
    handleSendMessage(prompt);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- SUB-COMPONENTS FOR DASHBOARD TABS ---

  const PilotageView = () => {
    const roadmapSteps = [
      { id: 1, title: "Fondations & Idée", desc: "Validation du problème et de la solution.", icon: Compass, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
      { id: 2, title: "Marché & Cible", desc: "Analyse concurrentielle et personas.", icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
      { id: 3, title: "Business Model", desc: `Mécanique de revenus en ${user.currency || 'devise locale'}.`, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
      { id: 4, title: "Structure Légale", desc: user.country === 'France' ? "Statuts (SAS/SARL), Kbis, Pacte." : "Incorporation et conformité locale.", icon: Shield, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
      { id: 5, title: "Finance & ROI", desc: "Trésorerie prévisionnelle et besoin en fond.", icon: Coins, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
      { id: 6, title: "Expansion", desc: "Marketing, Sales et Recrutement.", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
    ];

    return (
      <div className="p-6 lg:p-10 h-full overflow-y-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Tableau de Bord Stratégique</h2>
            <p className="text-slate-400">Vue d'ensemble du parcours entrepreneurial pour <span className="text-emerald-400 font-medium">{user.businessName || 'votre projet'}</span>.</p>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Stade Actuel</span>
                <span className="font-semibold text-slate-200">{user.stage}</span>
             </div>
             <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Juridiction</span>
                <span className="font-semibold text-slate-200">{user.country} <span className="text-slate-500">({user.currency})</span></span>
             </div>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Parcours & Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapSteps.map((step) => (
              <button 
                key={step.id}
                onClick={() => handleCardClick(step.title, step.desc)}
                className={`group relative p-6 rounded-2xl border ${step.border} ${step.bg} hover:bg-slate-800 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bg} border ${step.border}`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className="text-xs font-mono text-slate-500">ETAPE 0{step.id}</span>
                </div>
                <h4 className="text-xl font-bold text-slate-100 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{step.desc}</p>
                <div className="flex items-center text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                  Lancer le module <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick KPI Preview (Mock) */}
        <div>
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Aperçu Performances (Simulé)</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#1e293b] rounded-xl border border-slate-700 flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp className="text-emerald-500 w-5 h-5"/></div>
                  <div>
                    <div className="text-2xl font-bold text-white">0%</div>
                    <div className="text-xs text-slate-500">Achèvement Roadmap</div>
                  </div>
              </div>
              <div className="p-4 bg-[#1e293b] rounded-xl border border-slate-700 flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="text-blue-500 w-5 h-5"/></div>
                  <div>
                    <div className="text-2xl font-bold text-white">Focus</div>
                    <div className="text-xs text-slate-500">Satisfaction Client</div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // --- MAIN LAYOUT ---

  const menuItems = [
    { id: 'pilotage', label: 'Pilotage & Roadmap', icon: LayoutDashboard },
    { id: 'mentor', label: 'Mentor (Chat)', icon: MessageSquare },
    { id: 'studio', label: 'Studio (Documents)', icon: FileText },
    { id: 'simulation', label: 'Simulations', icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <span className="font-bold text-lg tracking-tight">BusinessMentor<span className="text-emerald-500">GPT</span></span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#020617] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 hidden lg:block">
             <h1 className="text-xl font-bold tracking-tight text-white">BusinessMentor<span className="text-emerald-500">GPT</span></h1>
             <div className="mt-2 flex items-center gap-1.5 opacity-60">
                <span className="font-['Pinyon_Script'] text-lg text-emerald-500 italic">by</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">Trigenys Group</span>
             </div>
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Globe size={10} />
                    <span className="truncate">{user.country}</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}

            {activeTab === 'studio' && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documents Générés</p>
                <div className="space-y-1">
                  {Object.values(PlanSection).map((section) => (
                    <button
                      key={section}
                      onClick={() => setActivePlanSection(section)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                        activePlanSection === section 
                          ? 'text-white bg-slate-800' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${activePlanSection === section ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                        {section}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2">
             <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700">
                <Download className="w-4 h-4" />
                <span>Exporter PDF</span>
             </button>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-0 relative overflow-hidden bg-[#0f172a]">
        
        {/* Tab Content Rendering */}
        <div className="flex-1 overflow-hidden relative">
          
          {activeTab === 'pilotage' && <PilotageView />}
          
          {activeTab === 'mentor' && (
             <div className="h-full flex flex-col">
                {/* Header specifically for Chat */}
                <div className="h-16 border-b border-slate-800 bg-[#0f172a]/50 flex items-center justify-between px-6">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500"/> Mentor Intelligent
                    </h2>
                    <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        Mode: Stratégie & Analyse
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                      messages={messages} 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading} 
                    />
                </div>
             </div>
          )}

          {activeTab === 'studio' && (
            <div className="h-full p-4 lg:p-8 overflow-y-auto">
               <div className="max-w-4xl mx-auto">
                 <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Studio de Documents</h2>
                        <p className="text-slate-400 text-sm">Consolidation de votre stratégie en documents exploitables.</p>
                    </div>
                 </div>
                 <PlanView activeSection={activePlanSection} currency={user.currency} />
               </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="h-full p-4 lg:p-8 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                <SimulationCharts user={user} />
              </div>
            </div>
          )}

        </div>
        
        {/* Hidden Print Area */}
        <div className="hidden print-only fixed inset-0 bg-white text-black z-[100] p-12 overflow-y-auto">
            {/* Styled Header for Print */}
            <div className="flex justify-between items-start mb-10 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Dossier Stratégique</h1>
                    <h2 className="text-xl text-gray-600">{user.businessName || 'Projet Entrepreneurial'}</h2>
                </div>
                <div className="text-right">
                    <div className="flex flex-col items-end">
                       <span className="font-bold text-lg text-slate-800 tracking-tight">BusinessMentor</span>
                       <div className="flex items-center gap-1.5 mt-0.5">
                         <span className="font-['Pinyon_Script'] text-2xl text-emerald-600 italic">by</span>
                         <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">TRIGENYS GROUP</span>
                       </div>
                    </div>
                </div>
            </div>
            
            <div className="mb-8 p-4 bg-gray-50 border rounded-lg flex justify-between">
               <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Entrepreneur</span>
                  <span className="font-medium">{user.name}</span>
               </div>
               <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Juridiction</span>
                  <span className="font-medium">{user.country}</span>
               </div>
               <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Devise de compte</span>
                  <span className="font-medium">{user.currency || 'EUR'}</span>
               </div>
               <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
               </div>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4 border-l-4 border-emerald-500 pl-4">Synthèse & Analyse</h3>
            <p className="mb-4 text-gray-600 italic">
               Ce document est généré automatiquement par BusinessMentor, l'intelligence stratégique de Trigenys Group. 
               Il synthétise les axes de travail définis lors de la session.
            </p>

            {/* Print Content from Plan View if user was there, or Chat logs */}
            {activeTab === 'studio' ? (
                <div className="mt-4">
                   <h4 className="text-lg font-bold uppercase tracking-wider text-gray-500 mb-2">{activePlanSection}</h4>
                   <PlanView activeSection={activePlanSection} currency={user.currency} />
                </div>
            ) : (
                <div className="space-y-4">
                   {messages.filter(m => m.role === 'model').map(m => (
                       <div key={m.id} className="mb-6">
                           <div className="text-xs text-gray-400 font-bold mb-1">MENTOR</div>
                           <p className="whitespace-pre-wrap text-justify leading-relaxed text-gray-800">{m.text}</p>
                       </div>
                   ))}
                </div>
            )}
            
            <div className="mt-20 pt-8 border-t text-center text-xs text-gray-400">
               <p>Document confidentiel généré via BusinessMentor by Trigenys Group.</p>
               <p>L'expertise stratégique au service de l'ambition.</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;