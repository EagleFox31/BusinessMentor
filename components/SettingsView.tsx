
import React, { useState, useEffect } from 'react';
import { Project, BusinessStage, BusinessType, UserProfile, CollaboratorProfile } from '../types';
import { Edit3, Target, Users, Plus, Trash2, User, AtSign, Save, Sparkles, Loader2, Briefcase, Crown } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sculptCollaboratorProfile } from '../services/blueprintForge';

interface SettingsViewProps {
  project: Project;
  user: UserProfile;
  onSaveProject: (updatedProject: Project) => Promise<void>;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ project, user, onSaveProject, onUpdateUser }) => {
  const [newCollabName, setNewCollabName] = useState('');
  const [userFields, setUserFields] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    role: user.role || '',
    expertise: (user.expertise || []).join(', ')
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [sculptingId, setSculptingId] = useState<string | null>(null);

  useEffect(() => {
    const legacyNames = project.collaborators || [];
    const richProfiles = project.collaboratorProfiles || [];
    if (legacyNames.length > 0 && richProfiles.length === 0) {
      const migratedProfiles: CollaboratorProfile[] = legacyNames.map((name, idx) => ({
        id: `migrated-${idx}-${Date.now()}`,
        name, role: '', bio: '', expertise: []
      }));
      onSaveProject({ ...project, collaboratorProfiles: migratedProfiles });
    }
  }, [project.id]);

  const handleUpdateField = (field: keyof Project, value: any) => {
    onSaveProject({ ...project, [field]: value });
  };

  const handleSaveUserProfile = async () => {
    setIsSavingUser(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const cleanUsername = userFields.username.replace('@', '').trim().toLowerCase();
      const updatedData = { 
        fullName: userFields.fullName, 
        username: cleanUsername,
        bio: userFields.bio,
        role: userFields.role,
        expertise: userFields.expertise.split(',').map(s => s.trim()).filter(Boolean)
      };
      await updateDoc(userRef, updatedData);
      onUpdateUser({ ...user, ...updatedData });
    } catch (e) {
      console.error("User update failed", e);
    } finally {
      setIsSavingUser(false);
    }
  };

  const addCollaborator = () => {
    if (!newCollabName.trim()) return;
    const currentCollabs = project.collaborators || [];
    const currentProfiles = project.collaboratorProfiles || [];
    if (currentCollabs.includes(newCollabName.trim())) return;
    
    const newProfile: CollaboratorProfile = {
      id: Date.now().toString(),
      name: newCollabName.trim(),
      role: '', bio: '', expertise: []
    };

    onSaveProject({
      ...project,
      collaborators: [...currentCollabs, newCollabName.trim()],
      collaboratorProfiles: [...currentProfiles, newProfile]
    });
    setNewCollabName('');
  };

  const removeCollaborator = (id: string, name: string) => {
    onSaveProject({
      ...project,
      collaborators: (project.collaborators || []).filter(n => n !== name),
      collaboratorProfiles: (project.collaboratorProfiles || []).filter(p => p.id !== id)
    });
  };

  const updateCollabProfile = (id: string, updates: Partial<CollaboratorProfile>) => {
    const updatedProfiles = (project.collaboratorProfiles || []).map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    handleUpdateField('collaboratorProfiles', updatedProfiles);
  };

  const handleSculpt = async (profile: CollaboratorProfile) => {
    setSculptingId(profile.id);
    try {
      const result = await sculptCollaboratorProfile(profile, project);
      updateCollabProfile(profile.id, result);
    } catch (e) {
      console.error("Sculpting failed", e);
    } finally {
      setSculptingId(null);
    }
  };

  return (
    <div className="p-8 lg:p-16 max-w-7xl mx-auto space-y-12 animate-fadeIn pb-32">
      <header className="space-y-4">
        <div className="trigenys-signature text-sky-500/40 font-black text-[10px] tracking-[0.4em] uppercase">CONFIGURATIONS SYSTÈME // CELLULE OPÉRATIONNELLE</div>
        <h1 className="text-5xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-none italic uppercase">Paramètres</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Identité Fondateur */}
        <div className="xl:col-span-1 space-y-8">
          <div className="glass-apex p-10 rounded-[3rem] border-sky-400/20 space-y-8 relative overflow-hidden bg-sky-950/10">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Crown className="w-24 h-24 text-sky-400" /></div>
            <div className="flex items-center gap-4 text-sky-400">
              <Crown className="w-6 h-6" />
              <h3 className="text-xl font-display font-bold uppercase tracking-widest italic">Votre Profil Fondateur</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" value={userFields.fullName} onChange={(e) => setUserFields(prev => ({...prev, fullName: e.target.value}))} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-sky-400/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Rôle Principal</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" value={userFields.role} onChange={(e) => setUserFields(prev => ({...prev, role: e.target.value}))} placeholder="Ex: CEO / Fondateur Technique" className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 pl-12 text-sky-400 font-bold outline-none focus:border-sky-400/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Expertises (séparées par virgules)</label>
                <input type="text" value={userFields.expertise} onChange={(e) => setUserFields(prev => ({...prev, expertise: e.target.value}))} placeholder="Stratégie, Architecture, Sales..." className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-sky-400/50" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bio de Mission</label>
                <textarea value={userFields.bio} onChange={(e) => setUserFields(prev => ({...prev, bio: e.target.value}))} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-sky-400/50 h-32 resize-none text-sm leading-relaxed" placeholder="Présentez votre parcours en 3 phrases..." />
              </div>
            </div>

            <button onClick={handleSaveUserProfile} disabled={isSavingUser} className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-sky-500 text-abyss rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-sky-500/20">
              {isSavingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Sauvegarder Mon Profil
            </button>
          </div>
        </div>

        {/* Co-pilotes */}
        <div className="xl:col-span-2 space-y-8">
          <div className="glass-apex p-10 rounded-[3.5rem] border-white/5 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex items-center gap-4 text-sky-400"><Users className="w-8 h-8" /><h3 className="text-2xl font-display font-bold uppercase tracking-widest italic">La Cellule (Co-pilotes)</h3></div>
               <div className="flex gap-2 w-full md:w-auto">
                  <input value={newCollabName} onChange={(e) => setNewCollabName(e.target.value)} placeholder="Nom du nouveau membre" className="flex-1 md:w-64 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-sky-400/30" onKeyDown={(e) => e.key === 'Enter' && addCollaborator()} />
                  <button onClick={addCollaborator} className="p-4 bg-sky-500 text-abyss rounded-2xl hover:bg-white transition-all shadow-lg shadow-sky-500/10"><Plus className="w-6 h-6" /></button>
               </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {(project.collaboratorProfiles || []).map((profile) => (
                <div key={profile.id} className="p-8 glass-apex rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all space-y-6 group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5"><User className="w-5 h-5 text-sky-400" /></div>
                        <input className="bg-transparent text-xl font-display font-bold text-white uppercase tracking-tight outline-none border-b border-transparent focus:border-sky-400/30 w-full" value={profile.name} onChange={(e) => updateCollabProfile(profile.id, { name: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2"><label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Rôle & Titre</label><div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700" /><input className="w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 pl-10 text-xs text-sky-400 font-bold outline-none focus:border-sky-400/20" placeholder="Ex: Architecte Solution" value={profile.role || ''} onChange={(e) => updateCollabProfile(profile.id, { role: e.target.value })} /></div></div>
                         <div className="space-y-2"><label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Résumé / Bio de mission</label><textarea className="w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-xs text-slate-400 outline-none focus:border-sky-400/20 h-20 resize-none" placeholder="Décrivez son expertise..." value={profile.bio || ''} onChange={(e) => updateCollabProfile(profile.id, { bio: e.target.value })} /></div>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end gap-3">
                      <button onClick={() => handleSculpt(profile)} disabled={sculptingId === profile.id} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-400/10 hover:border-sky-400 transition-all">
                        {sculptingId === profile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Sculpter
                      </button>
                      <button onClick={() => removeCollaborator(profile.id, profile.name)} className="p-3 text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
