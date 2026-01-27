
import React, { useEffect, useState } from 'react';
import { Project, UserProfile } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Plus, Briefcase, Calendar, Users, ArrowRight, LogOut } from 'lucide-react';
import { ApexLogo } from './Logo';

interface ProjectSelectorProps {
  user: UserProfile;
  onSelect: (p: Project) => void;
  onCreate: () => void;
  onLogout: () => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ user, onSelect, onCreate, onLogout }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const qOwner = query(collection(db, "projects"), where("ownerId", "==", user.uid));
        const qCollab = query(collection(db, "projects"), where("collaboratorEmails", "array-contains", user.email || ""));
        
        const [ownerSnap, collabSnap] = await Promise.all([getDocs(qOwner), getDocs(qCollab)]);
        
        const projectMap = new Map<string, Project>();
        
        ownerSnap.forEach((doc) => {
          projectMap.set(doc.id, { id: doc.id, ...doc.data() } as Project);
        });
        
        collabSnap.forEach((doc) => {
          projectMap.set(doc.id, { id: doc.id, ...doc.data() } as Project);
        });
        
        setProjects(Array.from(projectMap.values()));
      } catch (e) {
        console.error("Error fetching projects", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [user.uid, user.email]);

  const formatDate = (val: any) => {
    if (!val) return '...';
    try {
      let date: Date;
      // Cas 1: C'est déjà un objet Date JS
      if (val instanceof Date) date = val;
      // Cas 2: C'est un Timestamp Firestore avec la méthode .toDate()
      else if (typeof val.toDate === 'function') date = val.toDate();
      // Cas 3: C'est un objet brut {seconds, nanoseconds} (cas fréquent au fetch)
      else if (val.seconds !== undefined) date = new Date(val.seconds * 1000);
      // Cas 4: C'est une string ou un number
      else date = new Date(val);

      if (isNaN(date.getTime())) return 'Date indéterminée';
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Format inconnu';
    }
  };

  return (
    <div className="min-h-screen p-12 animate-fadeIn max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-20">
        <div className="flex items-center gap-6">
          <ApexLogo className="w-16 h-16" />
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter italic">Mission <span className="text-sky-400">Control</span></h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {user.email}
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="p-4 text-slate-700 hover:text-red-500 transition-colors flex items-center gap-2">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <button 
          onClick={onCreate}
          className="h-full min-h-[320px] rounded-[3rem] border-2 border-dashed border-white/5 hover:border-sky-400/50 hover:bg-sky-400/5 transition-all flex flex-col items-center justify-center gap-6 group"
        >
          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
            <Plus className="w-10 h-10 text-sky-400" />
          </div>
          <div className="text-center">
            <span className="block text-white font-bold text-xl uppercase tracking-tight">Nouvelle Mission</span>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 block">Initialiser un Blueprint</span>
          </div>
        </button>

        {isLoading ? (
          [1, 2].map(i => <div key={i} className="min-h-[320px] rounded-[3rem] glass-apex animate-pulse"></div>)
        ) : (
          projects.map(project => {
            const isOwner = project.ownerId === user.uid;
            const planValues = Object.values(project.plan || {});
            const progress = planValues.length > 0 
              ? Math.round(planValues.reduce((acc, curr) => acc + (curr?.completion || 0), 0) / 6)
              : 0;
            
            return (
              <button 
                key={project.id}
                onClick={() => onSelect(project)}
                className="p-10 rounded-[3rem] glass-apex border-white/5 hover:border-sky-400/40 transition-all text-left group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className={`w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:apex-glow ${!isOwner ? 'border-amber-500/30' : ''}`}>
                    <Briefcase className={`w-6 h-6 ${isOwner ? 'text-sky-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {(project.collaboratorEmails?.length || 0) + 1}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                      {isOwner ? 'Propriétaire' : 'Invité'}
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-display font-bold text-white mb-4 uppercase tracking-tighter leading-none group-hover:text-sky-400 transition-colors">
                  {project.name}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${isOwner ? 'bg-sky-500' : 'bg-amber-500'}`} 
                       style={{ width: `${progress}%` }}
                     ></div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isOwner ? 'text-sky-400' : 'text-amber-400'}`}>
                    Accéder au Cockpit
                  </span>
                  <ArrowRight className={`w-5 h-5 ${isOwner ? 'text-sky-400' : 'text-amber-400'}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;
