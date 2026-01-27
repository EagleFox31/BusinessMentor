
import React, { useState } from 'react';
import { PlanSection, PlanData, ChatMessage, UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';
import { 
  Eye, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Trophy, 
  Briefcase, 
  FileText, 
  PenTool, 
  Scale, 
  ArrowRight,
  Download,
  Layers,
  FileSearch,
  BookOpen,
  Archive
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { forgeFormalContract } from '../services/blueprintForge';

interface PlanViewProps {
  activeSection: PlanSection;
  planData: Partial<PlanData>;
  user: UserProfile;
  history: ChatMessage[];
}

const PlanView: React.FC<PlanViewProps> = ({ activeSection, planData, user, history }) => {
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);
  const [isGeneratingContract, setIsGeneratingContract] = useState<string | null>(null);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  
  const section = planData[activeSection];
  const content = section?.content;
  const completion = section?.completion || 0;

  // --- LOGIQUE D'EXPORT JURIDIQUE ---
  const downloadFormalPDF = async (title: string, rawContent: string, autoSave = true) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    doc.setDrawColor(20);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(title.toUpperCase(), pageWidth / 2, 80, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`PROJET : ${user.businessName?.toUpperCase() || 'SANS NOM'}`, pageWidth / 2, 100, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fait à ${user.country}, le ${new Date().toLocaleDateString()}`, pageWidth / 2, 110, { align: 'center' });
    
    doc.addPage();
    let y = 30;
    const paragraphs = rawContent.split('\n');
    paragraphs.forEach((line) => {
      const cleanLine = line.trim().replace(/[*#]/g, '');
      if (!cleanLine) { y += 4; return; }
      const isArticle = /ARTICLE\s+\d+/i.test(cleanLine);
      doc.setFont("helvetica", isArticle ? "bold" : "normal");
      doc.setFontSize(isArticle ? 11 : 10);
      const lines = doc.splitTextToSize(cleanLine, contentWidth);
      if (y + (lines.length * 6) > pageHeight - 30) { doc.addPage(); y = 30; }
      doc.text(lines, margin, y);
      y += (lines.length * 6) + 2;
    });

    if (autoSave) doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadSectionPDF = async (sectionName: PlanSection, sectionContent: string) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 165, 233);
    doc.text("RAPPORT D'EXTRACTION STRATÉGIQUE", margin, 15);
    doc.setFontSize(22);
    doc.setTextColor(255);
    doc.text(sectionName.toUpperCase(), margin, 32);

    let y = 60;
    const lines = sectionContent.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim().replace(/[#*]/g, '');
      if (!cleanLine) { y += 4; return; }
      const wrapped = doc.splitTextToSize(cleanLine, contentWidth);
      if (y + (wrapped.length * 6) > 275) { doc.addPage(); y = 30; }
      doc.text(wrapped, margin, y);
      y += (wrapped.length * 6) + 1;
    });

    doc.save(`Extraction_${sectionName}.pdf`);
  };

  const handleContractGeneration = async (type: any, label: string) => {
    setIsGeneratingContract(type);
    try {
      const formalText = await forgeFormalContract(type, history, user);
      await downloadFormalPDF(label, formalText);
    } catch (e) { console.error(e); } finally { setIsGeneratingContract(null); }
  };

  if (!content || completion < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 glass-apex rounded-[4rem] p-16 border-white/5 animate-fadeIn">
        <div className="w-28 h-28 bg-slate-950 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner">
          <Eye className="w-14 h-14 text-slate-700" />
        </div>
        <div className="max-w-md space-y-4">
          <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Actif non matérialisé</h3>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Le Blueprint stratégique n'est pas encore forgé. Engagez le mentor Horus pour initialiser l'extraction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-apex border-sky-400/20 text-sky-400 font-black text-[9px] tracking-[0.3em] uppercase">
                 <Trophy className="w-3 h-3" /> Maîtrise Palier : {Math.round(completion)}%
              </div>
              <h2 className="text-7xl font-display font-bold text-white tracking-tighter leading-none italic">{activeSection}</h2>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => downloadSectionPDF(activeSection, content)} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-sky-400/10 hover:border-sky-400 transition-all text-xs font-black uppercase tracking-widest text-slate-300">
                <Download className="w-4 h-4 text-sky-400" /> Rapport
              </button>
              <button onClick={() => setIsGeneratingPack(true)} className="flex items-center gap-3 px-8 py-4 bg-sky-400 text-abyss rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-400/20">
                <Archive className="w-4 h-4" /> Pack Alpha
              </button>
           </div>
        </div>
      </div>

      {activeSection === PlanSection.LEGAL && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp">
          {[
            { id: 'PACTE_ASSOCIES', label: 'Pacte d\'Associés', icon: PenTool },
            { id: 'STATUTS_DRAFT', label: 'Draft des Statuts', icon: Scale },
            { id: 'CONTRAT_PRESTATION', label: 'Modèle Contrat', icon: FileText }
          ].map(doc => (
            <button key={doc.id} onClick={() => handleContractGeneration(doc.id, doc.label)} disabled={!!isGeneratingContract} className="p-8 rounded-[2.5rem] glass-apex border-white/5 hover:border-sky-400 transition-all text-left flex flex-col gap-8 group">
               <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:apex-glow">
                  <doc.icon className="w-6 h-6 text-sky-400" />
               </div>
               <div>
                  <h4 className="font-display font-bold text-white uppercase text-sm tracking-widest">{doc.label}</h4>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2">Modèle Structuré</p>
               </div>
               <div className="mt-auto flex items-center justify-between opacity-50 group-hover:opacity-100">
                  <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Émettre PDF</span>
                  {isGeneratingContract === doc.id ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <ArrowRight className="w-4 h-4" />}
               </div>
            </button>
          ))}
        </div>
      )}

      <div className="glass-apex p-16 rounded-[4rem] border-white/5 relative overflow-hidden shadow-2xl">
        <div className="prose prose-invert prose-sky max-w-none relative z-10 prose-p:text-slate-400 prose-p:text-xl prose-p:leading-relaxed prose-p:font-light">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PlanView;
