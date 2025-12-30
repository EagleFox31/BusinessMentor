
import React, { useState } from 'react';
import { PlanSection, PlanData } from '../types';
import ReactMarkdown from 'react-markdown';
import { Eye, CheckCircle2, FileDown, Loader2, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PlanViewProps {
  activeSection: PlanSection;
  planData: Partial<PlanData>;
  userName: string;
}

const PlanView: React.FC<PlanViewProps> = ({ activeSection, planData, userName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const section = planData[activeSection];
  const content = section?.content;
  const completion = section?.completion || 0;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const margin = 20;
      let yPos = 20;

      // Titre du Document
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(2, 132, 199); // Blue
      doc.text("STRATEGIC BLUEPRINT", margin, yPos);
      
      yPos += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`PRÉPARÉ POUR : ${userName.toUpperCase()}`, margin, yPos);
      doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, 140, yPos);

      // Ligne de séparation
      yPos += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, yPos, 190, yPos);

      // Contenu du Plan
      Object.entries(planData).forEach(([key, data]) => {
        if (data && data.content && data.completion > 10) {
          yPos += 20;
          
          // Nouveau saut de page si nécessaire
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(15, 23, 42);
          doc.text(key.toUpperCase(), margin, yPos);
          
          yPos += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          
          // Nettoyage Markdown basique pour le texte PDF (Approche simplifiée)
          const cleanText = data.content.replace(/[#*`]/g, '');
          const splitText = doc.splitTextToSize(cleanText, 170);
          
          doc.text(splitText, margin, yPos);
          yPos += (splitText.length * 5);
        }
      });

      // Signature sur chaque page (Bas de page)
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        
        // La signature demandée
        doc.setFont("helvetica", "bold");
        doc.text("APEX HORUS", margin, 285);
        
        doc.setFont("helvetica", "italic");
        doc.text("by", 42, 285);
        
        doc.setFont("helvetica", "bold");
        doc.text("TRIGENYS GROUP", 47, 285);
        
        doc.text(`Page ${i} / ${pageCount}`, 170, 285);
      }

      doc.save(`ApexHorus_Blueprint_${userName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-5 glass-apex border-sky-400/20 text-sky-400 font-bold rounded-2xl hover:border-sky-400/50 transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            <span className="text-xs uppercase tracking-widest">Générer Blueprint PDF</span>
          </button>

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
                  <h4 className="text-sm font-bold text-white uppercase tracking-tighter">Altitude</h4>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Lock: {Math.round(completion)}%</p>
              </div>
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

        {/* Bloc Signature Visuel en bas du Studio */}
        <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-end">
           <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Seal of Excellence</span>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-sky-400" />
                 <span className="font-display font-bold text-white uppercase tracking-tighter">Apex Horus Digital Asset</span>
              </div>
           </div>
           <div className="text-right">
              <span className="font-signature text-3xl text-sky-400/80 italic">by Trigenys Group</span>
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-2">Executive Strategy Infrastructure</p>
           </div>
        </div>
      </div>
      
      {completion >= 85 && (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-apex-400/20 rounded-[2rem] gap-4 bg-sky-400/5">
           <CheckCircle2 className="text-apex-400 w-8 h-8" />
           <span className="text-xl font-display font-bold text-white italic">Ce palier est sous contrôle souverain. Prêt pour l'export.</span>
        </div>
      )}
    </div>
  );
};

export default PlanView;
