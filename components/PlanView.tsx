
import React, { useState } from 'react';
import { PlanSection, PlanData, ChatMessage, UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';
import { 
  Eye, 
  CheckCircle2, 
  FileDown, 
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
import { generateFormalDocument } from '../services/geminiService';

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

  // --- LOGIQUE D'EXPORT JURIDIQUE FORMEL (STRUCTURED & CLEAN) ---
  const downloadFormalPDF = async (title: string, rawContent: string, autoSave = true) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header élégant
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${user.businessName?.toUpperCase() || 'APEX'} - DOCUMENT CONFIDENTIEL`, margin, 15);
    doc.text(`PAGE 1`, pageWidth - margin, 15, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(margin, 18, pageWidth - margin, 18);

    // Titre Principal
    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.text(title.toUpperCase(), margin, 35);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString()} pour ${user.name} (${user.country})`, margin, 42);

    let y = 55;
    const paragraphs = rawContent.split('\n');
    let pageCount = 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40);

    paragraphs.forEach((line) => {
      const cleanLine = line.trim().replace(/[*#]/g, '');
      if (!cleanLine) {
        y += 4;
        return;
      }

      // Détection de structure (Articles / Titres)
      const isArticle = cleanLine.toUpperCase().startsWith('ARTICLE');
      const isTitle = cleanLine.toUpperCase().startsWith('TITRE') || (cleanLine.length < 50 && cleanLine.endsWith(':'));

      if (isArticle || isTitle) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60);
      }

      const lines = doc.splitTextToSize(cleanLine, contentWidth);
      
      // Gestion intelligente du saut de page
      if (y + (lines.length * 6) > pageHeight - 25) {
        doc.addPage();
        pageCount++;
        y = 25;
        // Répétition du header sur les pages suivantes
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${title.toUpperCase()}`, margin, 15);
        doc.text(`PAGE ${pageCount}`, pageWidth - margin, 15, { align: 'right' });
        doc.line(margin, 18, pageWidth - margin, 18);
        y = 30;
      }

      doc.text(lines, margin, y);
      y += (lines.length * 5.5) + 2;
    });

    // Bloc de Signatures Dynamique
    const allSignatories = [user.name, ...(user.collaborators || [])];
    
    if (y > pageHeight - 100) {
      doc.addPage();
      y = 30;
    }
    
    y += 20;
    doc.setDrawColor(230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("SIGNATURES DES PARTIES", margin, y);
    y += 15;

    // On dispose les signatures en grille (2 par ligne)
    allSignatories.forEach((signatory, index) => {
      const isEven = index % 2 === 0;
      const startX = isEven ? margin : (pageWidth / 2) + 5;
      const currentY = y + (Math.floor(index / 2) * 55);

      // Nouveau saut de page si nécessaire pour les signatures
      if (currentY + 50 > pageHeight - 20) {
         doc.addPage();
         y = 30; // Reset Y pour la nouvelle page
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.rect(startX, currentY, 75, 40);
      doc.text("Mention 'Lu et approuvé' :", startX + 5, currentY + 5);
      doc.setFont("helvetica", "bold");
      doc.text(`SIGNATURE : ${signatory.toUpperCase()}`, startX + 5, currentY + 35);
    });

    if (autoSave) doc.save(`${title.replace(/\s+/g, '_')}_${user.businessName}.pdf`);
    return doc;
  };

  // --- LOGIQUE D'EXPORT SECTION (STYLE WHITE PAPER) ---
  const downloadSectionPDF = async (sectionName: PlanSection, sectionContent: string, autoSave = true) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(14, 165, 233);
    doc.text("EXECUTIVE REPORT", margin, 15);
    doc.setTextColor(100, 116, 139);
    doc.text(`${user.businessName} // ${user.country}`, pageWidth - margin, 15, { align: 'right' });

    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text(sectionName, margin, 30);

    let y = 55;
    const lines = sectionContent.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) {
        y += 5;
        return;
      }

      const isHeader = cleanLine.startsWith('#');
      doc.setFont("helvetica", isHeader ? "bold" : "normal");
      doc.setFontSize(isHeader ? 13 : 10.5);
      doc.setTextColor(isHeader ? 2 : 51, isHeader ? 132 : 65, isHeader ? 199 : 85);
      
      const textToPrint = cleanLine.replace(/[#*]/g, '');
      const wrappedLines = doc.splitTextToSize(textToPrint, contentWidth);
      
      if (y + (wrappedLines.length * 6) > 275) { doc.addPage(); y = 30; }
      doc.text(wrappedLines, margin, y);
      y += (wrappedLines.length * 6) + (isHeader ? 2 : 0);
    });

    if (autoSave) doc.save(`Rapport_${sectionName.replace(/\s+/g, '_')}_${user.businessName}.pdf`);
    return doc;
  };

  // --- LOGIQUE MASTER BLUEPRINT (STYLE CYBER/INVESTOR) ---
  const downloadMasterBlueprint = async () => {
    setIsGeneratingMaster(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25;

      // Cover Page
      doc.setFillColor(2, 6, 23);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.text("MASTER BLUEPRINT", pageWidth / 2, 100, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(14, 165, 233);
      doc.text(user.businessName?.toUpperCase() || "PROJET APEX", pageWidth / 2, 115, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`FONDÉ PAR ${user.name.toUpperCase()} — ${user.country.toUpperCase()}`, pageWidth / 2, 130, { align: 'center' });
      
      // Content Pages
      Object.entries(planData).forEach(([title, data]) => {
        if (!data?.content || data.completion < 5) return;
        doc.addPage();
        doc.setFillColor(2, 6, 23);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(title, margin, 15);
        
        let y = 40;
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(data.content.replace(/[#*]/g, ''), pageWidth - (margin*2));
        doc.text(lines, margin, y);
      });

      doc.save(`Master_Blueprint_${user.businessName}.pdf`);
    } finally {
      setIsGeneratingMaster(false);
    }
  };

  const handleDownloadPack = async () => {
    setIsGeneratingPack(true);
    try {
      await downloadMasterBlueprint();
      for (const [title, data] of Object.entries(planData)) {
        if (data?.content && data.completion >= 5) {
          await downloadSectionPDF(title as PlanSection, data.content);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    } finally {
      setIsGeneratingPack(false);
    }
  };

  const handleContractGeneration = async (type: 'PACTE_ASSOCIES' | 'STATUTS_DRAFT' | 'CONTRAT_PRESTATION', label: string) => {
    setIsGeneratingContract(type);
    try {
      const formalText = await generateFormalDocument(type, history, user);
      await downloadFormalPDF(label, formalText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingContract(null);
    }
  };

  if (!content || completion < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 glass-apex rounded-[4rem] p-16 border-white/5 animate-fadeIn">
        <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner">
          <Eye className="w-14 h-14 text-slate-700" />
        </div>
        <div className="max-w-md space-y-4">
          <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Zone d'Extraction Vide</h3>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Le Blueprint stratégique n'est pas encore matérialisé. Engagez le mentor pour forger les piliers de votre empire.
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
                 <Trophy className="w-3 h-3" /> Palier de Maîtrise {completion >= 80 ? 'CRITIQUE' : 'ALPHA'}
              </div>
              <h2 className="text-6xl font-display font-bold text-white tracking-tighter leading-none">{activeSection}</h2>
           </div>

           <div className="flex items-center gap-6 glass-apex px-8 py-4 rounded-3xl border-white/10">
              <div className="text-right">
                 <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Précision de l'Actif</span>
                 <p className="text-xl font-display font-bold text-white">{Math.round(completion)}%</p>
              </div>
              <div className="w-1 h-10 bg-white/5 rounded-full"></div>
              <Layers className="text-sky-400 w-6 h-6 apex-glow" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <button 
             onClick={() => downloadSectionPDF(activeSection, content)}
             disabled={isGeneratingSection}
             className="flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-3xl hover:border-sky-400/50 hover:bg-slate-800 transition-all group"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-sky-400/10">
                    <FileSearch className="text-slate-500 group-hover:text-sky-400 w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Ciblé</span>
                    <span className="text-xs text-white font-bold group-hover:text-sky-400">Rapport de Section</span>
                 </div>
              </div>
              <Download className="w-4 h-4 text-slate-800 group-hover:text-sky-400" />
           </button>

           <button 
             onClick={downloadMasterBlueprint}
             disabled={isGeneratingMaster}
             className="flex items-center justify-between p-6 bg-slate-900 border border-white/10 rounded-3xl hover:border-sky-400 transition-all group shadow-xl"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-sky-400 w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stratégique</span>
                    <span className="text-xs text-white font-bold uppercase tracking-tighter">Master Blueprint</span>
                 </div>
              </div>
              <Layers className="w-4 h-4 text-sky-400" />
           </button>

           <button 
             onClick={handleDownloadPack}
             disabled={isGeneratingPack}
             className="flex items-center justify-between p-6 bg-sky-400 text-abyss rounded-3xl hover:bg-white transition-all group shadow-2xl shadow-sky-400/20"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-abyss/10 rounded-xl flex items-center justify-center">
                    <Archive className="text-abyss w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <span className="block text-[8px] font-black opacity-50 uppercase tracking-widest mb-1">Opérationnel</span>
                    <span className="text-xs font-black uppercase tracking-tighter">Tout émettre (Pack)</span>
                 </div>
              </div>
              {isGeneratingPack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {activeSection === PlanSection.LEGAL && (
        <div className="space-y-6">
           <div className="flex items-center gap-4 px-2">
              <Scale className="text-sky-400 w-5 h-5" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Coffre-fort Opérationnel</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'PACTE_ASSOCIES', label: 'Pacte d\'Associés', desc: 'Règles de gouvernance.', icon: PenTool },
                { id: 'STATUTS_DRAFT', label: 'Draft des Statuts', desc: 'Base immatriculation.', icon: Scale },
                { id: 'CONTRAT_PRESTATION', label: 'Modèle Contrat', desc: 'Sécurisation client.', icon: FileText }
              ].map(doc => (
                <button 
                   key={doc.id}
                   onClick={() => handleContractGeneration(doc.id as any, doc.label)}
                   disabled={!!isGeneratingContract}
                   className="p-8 rounded-[2.5rem] glass-apex border-white/5 hover:border-sky-400 transition-all text-left flex flex-col gap-6 group relative overflow-hidden"
                >
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:apex-glow">
                      <doc.icon className="w-6 h-6 text-sky-400" />
                   </div>
                   <div>
                      <h4 className="font-display font-bold text-white uppercase text-sm tracking-widest">{doc.label}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">{doc.desc}</p>
                   </div>
                   <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                      <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Générer Modèle</span>
                      {isGeneratingContract === doc.id ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <ArrowRight className="w-4 h-4 text-slate-800" />}
                   </div>
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="glass-apex p-16 rounded-[4rem] border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Briefcase size={300} />
        </div>
        
        <div className="prose prose-invert prose-sky max-w-none relative z-10 
          prose-h1:font-display prose-h1:text-5xl prose-h1:text-white prose-h1:tracking-tighter
          prose-h2:text-sky-400 prose-h2:font-bold prose-h2:uppercase prose-h2:text-sm prose-h2:tracking-widest prose-h2:mt-12
          prose-p:text-slate-400 prose-p:text-xl prose-p:leading-relaxed prose-p:font-light
          prose-strong:text-white prose-strong:font-bold
          prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-400">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-sky-400/20 shadow-xl">
                 <ShieldCheck className="w-8 h-8 text-sky-400 apex-glow" />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Certification Apex</span>
                 <span className="font-display font-bold text-white text-lg tracking-tight uppercase italic">Asset Numérique Validé</span>
              </div>
           </div>
           <div className="text-center sm:text-right">
              <span className="font-signature text-4xl text-sky-400/90 italic">by Trigenys Group</span>
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] mt-3">Sovereign Strategic Infrastructure</p>
           </div>
        </div>
      </div>
      
      {completion >= 85 && (
        <div className="flex items-center justify-center p-10 bg-sky-400/10 border border-sky-400/30 rounded-[3rem] gap-6 animate-pulse">
           <CheckCircle2 className="text-sky-400 w-10 h-10" />
           <span className="text-2xl font-display font-bold text-white italic tracking-tight">Modèle souverain prêt pour l'exécution.</span>
        </div>
      )}
    </div>
  );
};

export default PlanView;
