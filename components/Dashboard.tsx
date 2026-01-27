
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, FileText, BarChart2, LogOut, Target, TrendingUp, Globe, Shield, Eye, RefreshCw, Users, Settings, LayoutGrid, UserPlus, Mail, X, ShieldCheck, Plus, Sparkles, User, Briefcase, Trash2, Crown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { UserProfile, Project, ChatMessage, PlanSection, BusinessStage, BusinessType, CollaboratorProfile } from '../types';
import ChatInterface from './ChatInterface';
import SimulationCharts from './SimulationCharts';
import BlueprintStudio from './BlueprintStudio';
import SettingsView from './SettingsView';
import { ApexLogo } from './Logo';
import { initializeChat, sendMessageToMentor } from '../services/geminiService';
import { extractProjectData, sculptCollaboratorProfile } from '../services/blueprintForge';
import { db, sanitizeFirestoreData } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface DashboardProps {
  user: UserProfile;
  project: Project;
  onLogout: () => void;
  onProjectUpdate: (p: Project) => void;
  onUserUpdate: (u: UserProfile) => void;
  onBackToProjects: () => void;
}

type TabType = 'pilotage' | 'mentor' | 'studio' | 'simulation' | 'cellule' | 'settings';

const Dashboard: React.FC<DashboardProps> = ({ user, project, onLogout, onProjectUpdate, onUserUpdate, onBackToProjects }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pilotage');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePlanSection, setActivePlanSection] = useState<PlanSection>(PlanSection.IDEA_VALIDATION);
  const [newCollabName, setNewCollabName] = useState('');
  const [sculptingId, setSculptingId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const legacyNames = project.collaborators || [];
    const richProfiles = project.collaboratorProfiles || [];
    if (legacyNames.length > 0 && richProfiles.length === 0) {
      const migratedProfiles: CollaboratorProfile[] = legacyNames.map((name, idx) => ({
        id: `migrated-${idx}-${Date.now()}`,
        name, role: '', bio: '', expertise: []
      }));
      saveProject({ ...project, collaboratorProfiles: migratedProfiles });
    }
  }, [project.id]);

  const saveProject = async (updatedProject: Project) => {
    try {
      const projectRef = doc(db, "projects", project.id);
      const dataToSave = sanitizeFirestoreData({ ...updatedProject, lastUpdated: new Date() });
      await updateDoc(projectRef, dataToSave);
      onProjectUpdate(updatedProject);
    } catch (e) { console.error("Cloud sync error:", e); }
  };

  const saveUserRichProfile = async (updates: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const sanitized = sanitizeFirestoreData(updates);
      await updateDoc(userRef, sanitized);
      onUserUpdate({ ...user, ...updates });
    } catch (e) { console.error("User profile sync error:", e); }
  };

  useEffect(() => {
    const startSession = async () => {
      setIsLoading(true);
      try {
        await initializeChat({
          ...user,
          country: project.country,
          businessName: project.name,
          businessType: project.businessType,
          stage: project.stage,
          mainGoal: project.mainGoal,
          collaborators: project.collaborators
        } as any, project.history);
      } catch (e) { console.error("Session initialization failed:", e); } finally { setIsLoading(false); }
    };
    startSession();
  }, [project.id]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const uMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date(), groundingUrls: [] };
    const newHistory = [...project.history, uMsg];
    onProjectUpdate({ ...project, history: newHistory });
    setIsLoading(true);
    try {
      const response = await sendMessageToMentor(text);
      const mMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: response.text, timestamp: new Date(), groundingUrls: response.groundingUrls || [] };
      const updatedHistory = [...newHistory, mMsg];
      setIsSyncing(true);
      const distilled = await extractProjectData(updatedHistory, user as any);
      const updatedProject = { ...project, history: updatedHistory, plan: { ...project.plan, ...distilled } };
      await saveProject(updatedProject);
    } catch (e) { console.error("Message error:", e); } finally { setIsLoading(false); setIsSyncing(false); }
  };

  const addCollaborator = () => {
    if (!newCollabName.trim()) return;
    const currentCollabs = project.collaborators || [];
    const currentProfiles = project.collaboratorProfiles || [];
    if (currentCollabs.includes(newCollabName.trim())) return;
    const newProfile: CollaboratorProfile = { id: Date.now().toString(), name: newCollabName.trim(), role: '', bio: '', expertise: [] };
    saveProject({ ...project, collaborators: [...currentCollabs, newCollabName.trim()], collaboratorProfiles: [...currentProfiles, newProfile] });
    setNewCollabName('');
  };

  const removeCollaborator = (id: string, name: string) => {
    saveProject({
      ...project,
      collaborators: (project.collaborators || []).filter(n => n !== name),
      collaboratorProfiles: (project.collaboratorProfiles || []).filter(p => p.id !== id)
    });
  };

  const handleSculpt = async (profile: CollaboratorProfile | UserProfile, isUser = false) => {
    const id = isUser ? 'founder' : (profile as CollaboratorProfile).id;
    setSculptingId(id);
    try {
      const result = await sculptCollaboratorProfile(profile as any, project);
      if (isUser) {
        await saveUserRichProfile(result);
      } else {
        const updatedProfiles = (project.collaboratorProfiles || []).map(p => p.id === id ? { ...p, ...result } : p);
        saveProject({ ...project, collaboratorProfiles: updatedProfiles });
      }
    } catch (e) { console.error("Sculpting error:", e); } finally { setSculptingId(null); }
  };

  const roadmapItems = [
    { section: PlanSection.IDEA_VALIDATION, icon: Eye, color: "text-sky-400" },
    { section: PlanSection.MARKET_STUDY, icon: Globe, color: "text-cyan-400" },
    { section: PlanSection.BUSINESS_MODEL, icon: Target, color: "text-blue-400" },
    { section: PlanSection.LEGAL, icon: Shield, color: "text-slate-400" },
    { section: PlanSection.FINANCIALS, icon: TrendingUp, color: "text-emerald-400" },
    { section: PlanSection.GROWTH, icon: Target, color: "text-rose-400" },
  ];

  const menuItems = [
    { id: 'pilotage', label: 'Tactique', icon: LayoutDashboard },
    { id: 'mentor', label: 'Comm-Link', icon: MessageSquare },
    { id: 'studio', label: 'Blueprints', icon: FileText },
    { id: 'cellule', label: 'Cellule', icon: Users },
    { id: 'simulation', label: 'Sim-Deck', icon: BarChart2 },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden font-sans bg-transparent">
      {/* Sidebar Rétractable */}
      <aside 
        className={`bg-slate-950/80 backdrop-blur-3xl border-r border-sky-900/30 flex flex-col py-10 px-4 z-20 transition-all duration-500 ease-in-out relative ${isSidebarCollapsed ? 'w-24' : 'w-28 lg:w-80'}`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-12 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center border border-sky-400/50 shadow-lg shadow-sky-500/20 text-abyss hover:bg-white transition-all z-30"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className={`mb-16 flex flex-col items-center transition-all ${isSidebarCollapsed ? '' : 'lg:items-start lg:pl-4'}`}>
           <ApexLogo className="w-12 h-12 mb-4 cursor-pointer" onClick={onBackToProjects} />
           {!isSidebarCollapsed && (
             <div className="hidden lg:block w-full overflow-hidden">
               <span className="block font-display font-bold text-2xl tracking-tighter text-white uppercase truncate">{project.name}</span>
               <div className="trigenys-signature text-[7px] opacity-40 mt-1 uppercase tracking-widest">MISSION ACTIVE</div>
             </div>
           )}
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all duration-300 relative group ${activeTab === item.id ? 'bg-sky-500/10 text-sky-400 border border-sky-400/20 shadow-lg shadow-sky-500/10' : 'text-slate-600 hover:text-slate-300'}`}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${activeTab === item.id ? 'apex-glow' : ''}`} />
              {!isSidebarCollapsed && <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap">{item.label}</span>}
              
              {/* Tooltip in collapsed mode */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-6 px-4 py-2 bg-sky-500 text-abyss text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button onClick={onBackToProjects} className="w-full flex items-center gap-4 p-5 text-slate-700 hover:text-sky-400 transition-colors group relative">
            <LayoutGrid className="w-6 h-6 shrink-0" />
            {!isSidebarCollapsed && <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Missions</span>}
            {isSidebarCollapsed && <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl z-50">Missions</div>}
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-5 text-slate-700 hover:text-red-500 transition-colors group relative">
            <LogOut className="w-6 h-6 shrink-0" />
            {!isSidebarCollapsed && <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Logout</span>}
            {isSidebarCollapsed && <div className="absolute left-full ml-6 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap shadow-xl z-50">Logout</div>}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden bg-transparent z-10 custom-scrollbar overflow-y-auto">
        {activeTab === 'pilotage' && (
          <div className="p-12 space-y-16 animate-fadeIn">
            <header className="flex justify-between items-end">
               <div className="space-y-4">
                  <div className="trigenys-signature text-sky-500/40">PROJET: {project.name} // {project.businessType}</div>
                  <h1 className="text-7xl font-display font-bold text-white tracking-tighter leading-none italic">Status <span className="text-sky-400">Mission</span></h1>
               </div>
               <div className="glass-apex px-10 py-6 rounded-[2.5rem] border-sky-400/20 flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-[9px] text-sky-500/60 uppercase tracking-widest font-black mb-1">Impact Global</span>
                    <div className="flex items-center gap-3"><span className="text-4xl font-display font-bold text-sky-400 apex-glow">{Math.round(Object.values(project.plan || {}).reduce((acc, curr) => acc + (curr?.completion || 0), 0) / 6)}%</span></div>
                  </div>
                  <TrendingUp className="text-sky-400 w-8 h-8 apex-glow" />
               </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roadmapItems.map((item) => {
                const progress = project.plan?.[item.section]?.completion || 0;
                return (
                  <button key={item.section} onClick={() => { setActivePlanSection(item.section); setActiveTab('mentor'); }} className="group p-10 rounded-[3rem] glass-apex hover:border-sky-400/40 transition-all text-left relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10">
                       <div className={`w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 transition-all group-hover:border-sky-400/50 ${progress > 0 ? 'apex-glow' : ''}`}><item.icon className={`w-6 h-6 ${progress > 0 ? item.color : 'text-slate-600'}`} /></div>
                       <div className="text-right"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest block mb-1">LOCK STATUS</span><span className={`text-xl font-display font-bold ${progress > 50 ? 'text-sky-400' : progress > 0 ? 'text-slate-400' : 'text-slate-700'}`}>{Math.round(progress)}%</span></div>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase group-hover:text-sky-400 transition-colors leading-tight">{item.section}</h3>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mt-8"><div className="h-full bg-sky-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {activeTab === 'mentor' && (
           <div className="h-full flex flex-col animate-fadeIn">
             <div className="h-24 border-b border-sky-900/20 flex items-center justify-between px-12 glass-apex z-10">
                <div className="flex flex-col"><div className="flex items-center gap-3"><div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div><h2 className="text-xl font-display font-bold uppercase tracking-widest text-white italic">Signal: <span className="text-sky-400">{activePlanSection}</span></h2></div></div>
                {isSyncing && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-sky-500/5 border border-sky-400/20 animate-pulse"><RefreshCw className="w-3 h-3 text-sky-400 animate-spin" /><span className="text-[9px] font-black text-sky-400 tracking-widest uppercase">Sync En cours...</span></div>
                )}
             </div>
             <ChatInterface messages={project.history} onSendMessage={handleSendMessage} isLoading={isLoading} />
           </div>
        )}

        {activeTab === 'cellule' && (
           <div className="p-16 max-w-6xl mx-auto space-y-12 animate-fadeIn">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div className="space-y-4">
                 <div className="trigenys-signature text-sky-500/40">GOUVERNANCE & UNITÉ</div>
                 <h1 className="text-7xl font-display font-bold text-white tracking-tighter leading-none italic uppercase">La <span className="text-sky-400">Cellule</span></h1>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <input value={newCollabName} onChange={(e) => setNewCollabName(e.target.value)} placeholder="Nom du co-pilote..." className="flex-1 md:w-64 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-sky-400/30" onKeyDown={(e) => e.key === 'Enter' && addCollaborator()} />
                  <button onClick={addCollaborator} className="p-5 bg-sky-500 text-abyss rounded-2xl hover:bg-white transition-all shadow-lg shadow-sky-500/10"><Plus /></button>
               </div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* 1. Profil du Fondateur (User) */}
               <div className="p-10 glass-apex rounded-[3.5rem] border-sky-400/40 bg-sky-950/20 shadow-2xl shadow-sky-500/5 group flex flex-col gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Crown className="w-40 h-40 text-sky-400" /></div>
                  <div className="flex justify-between relative z-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center border border-white/10 apex-glow"><Crown className="w-8 h-8 text-abyss" /></div>
                        <div>
                           <h3 className="text-3xl font-display font-bold text-white uppercase italic tracking-tighter">{user.fullName || user.name}</h3>
                           <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> FONDATEUR / CEO</p>
                        </div>
                     </div>
                  </div>
                  <p className="text-base text-slate-300 leading-relaxed font-light italic relative z-10">{user.bio || "Le visionnaire derrière cette mission. En attente de sculpture stratégique..."}</p>
                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-white/5 relative z-10">
                     <div className="flex gap-2">
                        {user.expertise?.slice(0, 3).map((exp, i) => <span key={i} className="px-3 py-1.5 bg-sky-400/20 rounded-xl text-[9px] font-black uppercase text-sky-400 border border-sky-400/20">{exp}</span>)}
                        {(!user.expertise || user.expertise.length === 0) && <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">En attente d'expertise...</span>}
                     </div>
                     <button onClick={() => handleSculpt(user, true)} disabled={sculptingId === 'founder'} className="flex items-center gap-2 text-sky-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-xl border border-white/5">
                       {sculptingId === 'founder' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Sculpter
                     </button>
                  </div>
               </div>

               {/* 2. Profils des Collaborateurs */}
               {(project.collaboratorProfiles || []).map((profile) => (
                 <div key={profile.id} className="p-8 glass-apex rounded-[3rem] border-white/5 hover:border-sky-400/30 transition-all group flex flex-col gap-6">
                    <div className="flex justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:apex-glow"><User className="w-6 h-6 text-sky-400" /></div>
                          <div>
                             <h3 className="text-2xl font-display font-bold text-white uppercase italic">{profile.name}</h3>
                             <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1"><Briefcase className="w-3 h-3" /> {profile.role || "Rôle non sculpté"}</p>
                          </div>
                       </div>
                       <button onClick={() => removeCollaborator(profile.id, profile.name)} className="p-3 text-slate-800 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">{profile.bio || "En attente de sculpture stratégique..."}</p>
                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                       <div className="flex gap-2">
                          {profile.expertise?.slice(0, 3).map((exp, i) => <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500">{exp}</span>)}
                       </div>
                       <button onClick={() => handleSculpt(profile)} disabled={sculptingId === profile.id} className="flex items-center gap-2 text-sky-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                         {sculptingId === profile.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Sculpter
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'studio' && <BlueprintStudio project={project} user={user} onUpdateProject={saveProject} />}
        {activeTab === 'simulation' && <div className="p-16"><SimulationCharts user={{ country: project.country, currency: project.currency } as any} /></div>}
        {activeTab === 'settings' && <SettingsView project={project} user={user} onSaveProject={saveProject} onUpdateUser={onUserUpdate} />}
      </main>
    </div>
  );
};

export default Dashboard;
