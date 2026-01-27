
import React, { useState, useEffect, useRef } from 'react';
import { Project, UserProfile, BlueprintDocType } from '../types';
import { 
  FileText, Zap, Layout, Target, CreditCard, Shield, ClipboardList, 
  X, BookOpen, PenTool, Settings2, TrendingUp, Rocket, Users, Code, 
  Wallet, Scale, CheckSquare, FileCheck, Layers, Award, Sparkles, Send, Loader2, RefreshCw, Bot, User, Maximize2, Download
} from 'lucide-react';
import { forgeProfessionalAsset, refineProfessionalAssetWithChat } from '../services/blueprintForge';
import { exportToProfessionalPDF } from '../services/pdfExportService';
import ReactMarkdown from 'react-markdown';

interface AssetDef { 
  id: BlueprintDocType; 
  label: string; 
  icon: any; 
  description: string;
  category: 'VISION' | 'BUSINESS' | 'GOUVERNANCE' | 'VENTE' | 'DELIVERY' | 'PRODUIT' | 'BRANDING';
}

const ASSETS: AssetDef[] = [
  { id: 'CONCEPT_ONE_PAGER', category: 'VISION', label: 'One-Pager', icon: Layout, description: 'La vision exécutive institutionnelle.' },
  { id: 'PITCH_SCRIPT', category: 'VISION', label: 'Pitch Script', icon: Zap, description: 'Script 2min + 20s pour convaincre.' },
  { id: 'ROADMAP_12M', category: 'VISION', label: 'Roadmap 12m', icon: TrendingUp, description: 'Jalons stratégiques trimestriels.' },
  { id: 'GTM_STRATEGY', category: 'VISION', label: 'Go-To-Market', icon: Rocket, description: 'Stratégie d\'acquisition 0-10 clients.' },
  { id: 'BUSINESS_MODEL_RESUME', category: 'BUSINESS', label: 'Business Model', icon: Target, description: 'Anatomie économique du projet.' },
  { id: 'FINANCIAL_FORECAST', category: 'BUSINESS', label: 'Prévisionnel 12m', icon: Wallet, description: 'CA, charges et cashflow.' },
  { id: 'UNIT_ECONOMICS', category: 'BUSINESS', label: 'Unit Economics', icon: Scale, description: 'LTV, CAC et seuil de rentabilité.' },
  { id: 'PACTE_ASSOCIES', category: 'GOUVERNANCE', label: 'Pacte Associés', icon: Shield, description: 'Règles de décision et vesting.' },
  { id: 'CAP_TABLE', category: 'GOUVERNANCE', label: 'Cap Table', icon: Layers, description: 'Répartition du capital et dilution.' },
  { id: 'RACI_ORG', category: 'GOUVERNANCE', label: 'RACI Internes', icon: Users, description: 'Responsabilités et organigramme.' },
  { id: 'CHARTE_ETHIQUE', category: 'GOUVERNANCE', label: 'Charte Éthique', icon: Award, description: 'Valeurs et code de conduite.' },
  { id: 'OFFRES_PRICING', category: 'VENTE', label: 'Offres & Pricing', icon: CreditCard, description: 'Packaging et grille tarifaire.' },
  { id: 'PROP_COMMERCIALE', category: 'VENTE', label: 'Prop. Commerciale', icon: FileText, description: 'Template de vente institutionnel.' },
  { id: 'SOW_TEMPLATE', category: 'VENTE', label: 'SOW / Cadrage', icon: ClipboardList, description: 'Périmètre IN/OUT et jalons.' },
  { id: 'CHANGE_REQUEST_FORM', category: 'VENTE', label: 'Change Request', icon: FileText, description: 'Modèle de gestion des évolutions.' },
  { id: 'PV_RECETTE', category: 'VENTE', label: 'PV de Recette', icon: FileCheck, description: 'Validation finale et livraison.' },
  { id: 'PLAYBOOK_DELIVERY', category: 'DELIVERY', label: 'Playbook Livraison', icon: BookOpen, description: 'Process d\'excellence opérationnelle.' },
  { id: 'PRD_MINIMAL', category: 'PRODUIT', label: 'PRD Minimal', icon: Code, description: 'Spécifications MVP et User Stories.' },
  { id: 'SPEC_TECH', category: 'PRODUIT', label: 'Spec Tech', icon: Layers, description: 'Architecture, Stack et Sécurité.' },
  { id: 'QA_PLAN', category: 'PRODUIT', label: 'Plan de Tests', icon: CheckSquare, description: 'Checklist de qualité et release.' },
  { id: 'COMPANY_PROFILE', category: 'BRANDING', label: 'Company Profile', icon: FileText, description: 'Plaquette institutionnelle 4 pages.' },
  { id: 'BRAND_KIT_SUMMARY', category: 'BRANDING', label: 'Brand Kit', icon: Layout, description: 'Synthèse de charte graphique.' },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface BlueprintStudioProps {
  project: Project;
  user: UserProfile;
  onUpdateProject: (updatedProject: Project) => Promise<void>;
}

const BlueprintStudio: React.FC<BlueprintStudioProps> = ({ project, user, onUpdateProject }) => {
  const [activeDoc, setActiveDoc] = useState<BlueprintDocType | null>(null);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [refineQuery, setRefineQuery] = useState('');
  const [refineHistory, setRefineHistory] = useState<ChatMessage[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [refineHistory]);

  const handleOpenDoc = (id: BlueprintDocType) => {
    setActiveDoc(id);
    setRefineHistory([]);
    if (project.generatedAssets && project.generatedAssets[id]) {
      setDocContent(project.generatedAssets[id]);
    } else {
      setDocContent(null);
    }
  };

  const handleGenerate = async (id: BlueprintDocType) => {
    setIsGenerating(true);
    setRefineHistory([]);
    try {
      const content = await forgeProfessionalAsset(id, project, user);
      setDocContent(content);
      const updatedAssets = { ...(project.generatedAssets || {}), [id]: content };
      await onUpdateProject({ ...project, generatedAssets: updatedAssets });
    } catch (e) {
      console.error(e);
      setDocContent("## Échec de la Forge\nVeuillez réessayer l'extraction.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refineQuery.trim() || !activeDoc || !docContent) return;
    
    const newUserMessage: ChatMessage = { role: 'user', text: refineQuery };
    setRefineHistory(prev => [...prev, newUserMessage]);
    setRefineQuery('');
    setIsRefining(true);

    try {
      const result = await refineProfessionalAssetWithChat(
        activeDoc, 
        docContent, 
        newUserMessage.text, 
        refineHistory, 
        project, 
        user
      );
      
      setDocContent(result.updatedContent);
      setRefineHistory(prev => [...prev, { role: 'assistant', text: result.assistantMessage }]);
      
      const updatedAssets = { ...(project.generatedAssets || {}), [activeDoc]: result.updatedContent };
      await onUpdateProject({ ...project, generatedAssets: updatedAssets });
    } catch (e) {
      console.error("Refinement error:", e);
      setRefineHistory(prev => [...prev, { role: 'assistant', text: "Désolé, une erreur s'est produite lors de la co-rédaction." }]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownload = async () => {
    if (!docContent || !activeDoc) return;
    setIsExporting(true);
    const label = ASSETS.find(a => a.id === activeDoc)?.label || activeDoc;
    try {
      await exportToProfessionalPDF(docContent, label, project);
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ['VISION', 'BUSINESS', 'GOUVERNANCE', 'VENTE', 'DELIVERY', 'PRODUIT', 'BRANDING'];

  return (
    <div className="p-8 lg:p-16 max-w-7xl mx-auto space-y-20 animate-fadeIn pb-32 relative bg-transparent">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
        <div className="space-y-4">
          <div className="trigenys-signature text-sky-500/60 uppercase font-black text-[8px] tracking-[0.4em]">APEX ASSET STUDIO // MISSION CRITICAL LAUNCH KIT</div>
          <h1 className="text-6xl font-display font-bold text-white tracking-tighter leading-none italic uppercase">
            Le <span className="text-sky-400">Blueprint</span>
          </h1>
        </div>
        <button 
          onClick={() => setShowEditor(!showEditor)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${showEditor ? 'bg-sky-400 text-abyss shadow-lg shadow-sky-400/20' : 'glass-apex border-white/10 text-slate-400 hover:border-sky-400'}`}
        >
          <Settings2 className="w-4 h-4" /> Configurer l'Extraction
        </button>
      </header>

      {categories.map(cat => (
        <section key={cat} className="space-y-10">
          <div className="flex items-center gap-6">
             <h2 className="text-sm font-black text-sky-400/60 uppercase tracking-[0.6em] whitespace-nowrap">{cat}</h2>
             <div className="h-px w-full bg-gradient-to-r from-sky-400/20 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ASSETS.filter(a => a.category === cat).map(asset => {
              const isGenerated = !!(project.generatedAssets && project.generatedAssets[asset.id]);
              return (
                <button 
                  key={asset.id}
                  onClick={() => handleOpenDoc(asset.id)}
                  className={`group p-8 rounded-[2.5rem] glass-apex border-white/5 hover:border-sky-400/50 transition-all text-left flex flex-col gap-6 relative overflow-hidden ${isGenerated ? 'border-sky-400/20 shadow-lg shadow-sky-500/5' : ''}`}
                >
                  <div className={`w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:apex-glow transition-all ${isGenerated ? 'border-sky-400/30' : ''}`}>
                    <asset.icon className={`w-5 h-5 ${isGenerated ? 'text-sky-400' : 'text-slate-600'}`} />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="font-display font-bold text-white uppercase text-xs tracking-widest leading-tight">{asset.label}</h3>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{asset.description}</p>
                    {isGenerated && <span className="absolute -top-10 -right-4 text-[8px] font-black bg-sky-500/10 text-sky-400 px-2 py-1 rounded-full uppercase border border-sky-400/20">Archivé</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {activeDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
          <div className="absolute inset-0 bg-abyss/95 backdrop-blur-2xl" onClick={() => setActiveDoc(null)}></div>
          
          <div className="relative w-full max-w-[98%] h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* PDF Viewer Mode */}
            <div className="flex-1 rounded-[3rem] border border-white/10 flex flex-col overflow-hidden bg-[#1e2124] shadow-2xl relative">
              <header className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#16181b]">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-sky-500/10 rounded-xl">
                    <FileText className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-display font-bold text-white uppercase italic tracking-tighter leading-none">
                      {ASSETS.find(a => a.id === activeDoc)?.label}
                    </h2>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Prévisualisation Documentaire</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {docContent && !isGenerating && (
                    <>
                      <button onClick={handleDownload} disabled={isExporting} className="flex items-center gap-2 px-6 py-3 bg-sky-400 text-abyss rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-400/20 hover:bg-white transition-all">
                        {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Export PDF
                      </button>
                      <button onClick={() => handleGenerate(activeDoc)} className="p-3 text-slate-500 hover:text-sky-400 transition-colors bg-white/5 rounded-xl border border-white/5">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setActiveDoc(null)} className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-[#121417]">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
                    <div className="w-16 h-16 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white font-display font-bold text-2xl uppercase tracking-tighter italic">Sculpture de l'actif...</p>
                  </div>
                ) : !docContent ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-10 text-center">
                    <button onClick={() => handleGenerate(activeDoc)} className="px-12 py-6 bg-sky-500 text-abyss font-black rounded-3xl uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all">Lancer la Forge</button>
                  </div>
                ) : (
                  /* Simulation de page A4 physique - Correction : h-fit pour éviter le débordement */
                  <div className="flex flex-col items-center w-full min-h-full py-10">
                    <div className="w-full max-w-[800px] bg-white text-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-sm h-fit min-h-[1131px] p-[25mm] animate-fadeInUp origin-top mb-20 flex-shrink-0">
                      {/* Header Documentaire */}
                      <div className="border-b-4 border-sky-500 pb-10 mb-12">
                         <h1 className="text-4xl font-bold text-sky-500 uppercase tracking-tighter mb-4">{ASSETS.find(a => a.id === activeDoc)?.label}</h1>
                         <div className="flex justify-between items-end">
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROJET : {project.name.toUpperCase()}</p>
                             <p className="text-[9px] text-slate-300 font-medium">TRIGENYS GROUP STRATEGIC ASSET</p>
                           </div>
                           <p className="text-[10px] text-slate-400 font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
                         </div>
                      </div>

                      <div className="prose prose-slate max-w-none prose-h2:text-sky-500 prose-h2:uppercase prose-h2:font-bold prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed">
                        <ReactMarkdown>{docContent}</ReactMarkdown>
                      </div>

                      <div className="mt-24 pt-10 border-t border-slate-100 text-[8px] text-slate-300 text-center uppercase tracking-widest italic font-medium">
                         Document strictement confidentiel — Propriété exclusive de {project.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Dialogue Refiner IA */}
            {docContent && !isGenerating && (
              <div className="w-full lg:w-[400px] rounded-[3rem] border border-white/10 flex flex-col overflow-hidden bg-slate-950/90 shadow-2xl animate-fadeInRight">
                <div className="p-8 border-b border-white/5 bg-sky-500/5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-abyss" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-sky-400 uppercase tracking-widest">Studio Refiner</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Éditeur Intelligent</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-[11px]">
                  {refineHistory.length === 0 && (
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-slate-400 leading-relaxed italic font-light">
                      "Bonjour ! Comment puis-je vous aider à parfaire ce document ? Vous pouvez me demander d'ajouter des sections, de modifier le ton, ou d'intégrer de nouvelles données."
                    </div>
                  )}
                  {refineHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start animate-fadeIn'}`}>
                       <div className={`px-5 py-4 rounded-2xl leading-relaxed max-w-[90%] ${msg.role === 'user' ? 'bg-sky-500 text-abyss font-bold' : 'bg-white/5 text-slate-200'}`}>
                         {msg.text}
                       </div>
                    </div>
                  ))}
                  {isRefining && (
                    <div className="flex items-center gap-3 animate-pulse text-sky-400 font-black uppercase text-[8px] tracking-widest">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Analyse des calques...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-8 bg-slate-950/40 border-t border-white/5">
                   <div className="relative group">
                     <textarea 
                       value={refineQuery} 
                       onChange={(e) => setRefineQuery(e.target.value)} 
                       placeholder="Instructions de modification..." 
                       className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white outline-none focus:border-sky-400/40 transition-all h-24 resize-none placeholder:text-slate-700"
                       onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRefine())}
                     />
                     <button 
                       onClick={handleRefine} 
                       disabled={isRefining || !refineQuery.trim()} 
                       className="absolute bottom-4 right-4 p-2 bg-sky-500 text-abyss rounded-xl disabled:opacity-30 hover:bg-white transition-all shadow-lg"
                     >
                       <Send className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlueprintStudio;
