
import React from 'react';
import { PlanSection, PlanData } from '../types';
import ReactMarkdown from 'react-markdown';
import { Eye, CheckCircle2, ChevronRight } from 'lucide-react';

interface PlanViewProps {
  activeSection: PlanSection;
  planData: Partial<PlanData>;
}

const PlanView: React.FC<PlanViewProps> = ({ activeSection, planData }) => {
  const section = planData[activeSection];
  const content = section?.content;
  const completion = section?.completion || 0;

  if (!content || completion < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 glass-apex rounded-[3rem] p-12">
        <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5">
          <Eye className="w-12 h-12 text-slate-600" />
        </div>
        <div className="max-w-md">
          <h3 className="text-2xl font-display font-bold text-white">Zone Ombreuse</h3>
          <p className="text-slate-500 mt-3 text-lg">Le Faucon n'a pas encore scanné cette dimension. Initiez un dialogue avec le mentor pour éclairer ce palier.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-apex-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
              <div className="w-2 h-2 bg-apex-400 rounded-full animate-pulse"></div> Stratégie de Niveau 01
           </div>
           <h2 className="text-5xl font-display font-bold text-white tracking-tight">{activeSection}</h2>
        </div>
        
        <div className="flex items-center gap-6 glass-apex px-8 py-6 rounded-3xl">
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-900" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * completion) / 100} className="text-apex-400 transition-all duration-1000 gold-glow" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-apex-400">
                    {Math.round(completion)}%
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-white">Altitude Validée</h4>
                <p className="text-xs text-slate-500 font-medium">Structure stabilisée à {completion}%</p>
            </div>
        </div>
      </div>

      <div className="glass-apex p-12 rounded-[3rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Eye size={200} />
        </div>
        <div className="prose prose-invert prose-amber max-w-none relative z-10 
          prose-h1:font-display prose-h1:text-apex-400 prose-h2:text-white prose-h2:font-bold
          prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      
      {completion >= 85 && (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-apex-400/20 rounded-[2rem] gap-4">
           <CheckCircle2 className="text-apex-400 w-8 h-8" />
           <span className="text-xl font-display font-bold text-white italic">Ce palier est sous contrôle souverain.</span>
        </div>
      )}
    </div>
  );
};

export default PlanView;
