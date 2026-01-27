import React, { useState } from 'react';
import { UserProfile, BusinessStage, BusinessType, Project } from '../types';
import { ArrowRight, Check, Target, Briefcase, Lightbulb, ChevronLeft, Globe, Zap, Compass, Users, Plus, X } from 'lucide-react';
// Fix: Use sanitizeFirestoreData as it is the correctly exported member from firebase service
import { db, sanitizeFirestoreData } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';

interface CountryData {
  name: string;
  currency: string;
}

interface OnboardingWorkflowProps {
  user: UserProfile;
  onComplete: (project: Project) => void;
}

const GEOGRAPHY: any = {
  "Afrique": {
    "Afrique Centrale": [
      { name: "Cameroun", currency: "XAF" },
      { name: "Gabon", currency: "XAF" },
      { name: "Congo (Brazzaville)", currency: "XAF" },
      { name: "RDC", currency: "CDF" },
      { name: "Tchad", currency: "XAF" }
    ],
    "Afrique de l'Ouest": [
      { name: "Côte d'Ivoire", currency: "XOF" },
      { name: "Sénégal", currency: "XOF" }
    ]
  },
  "Europe": {
    "Europe de l'Ouest": [
      { name: "France", currency: "EUR" },
      { name: "Belgique", currency: "EUR" },
      { name: "Suisse", currency: "CHF" }
    ]
  }
};

const OnboardingWorkflow: React.FC<OnboardingWorkflowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Project>>({
    ownerId: user.uid,
    ownerEmail: user.email || '',
    collaborators: [],
    collaboratorEmails: [],
    equityShares: {},
    plan: {},
    history: [],
    createdAt: new Date()
  });

  const [locStep, setLocStep] = useState<'continent' | 'region' | 'country'>('continent');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [newCollab, setNewCollab] = useState('');

  const updateField = (field: keyof Project, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    try {
      const projectDataRaw = {
        ...formData,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      
      // Fix: Call sanitizeFirestoreData instead of cleanFirestoreData
      const projectData = sanitizeFirestoreData(projectDataRaw);
      
      const docRef = await addDoc(collection(db, "projects"), projectData);
      
      await updateDoc(doc(db, "users", user.uid), {
        projectIds: arrayUnion(docRef.id)
      });

      onComplete({ id: docRef.id, ...projectDataRaw } as Project);
    } catch (e) {
      console.error("Project Creation failed", e);
    }
  };

  const renderStep1_Location = () => (
    <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center">
        <Compass className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold text-white uppercase">Secteur Tactique</h2>
      </div>

      <div className="min-h-[280px]">
        {locStep === 'continent' && (
          <div className="grid grid-cols-3 gap-6">
            {Object.keys(GEOGRAPHY).map(c => (
              <button key={c} onClick={() => { setSelectedContinent(c); setLocStep('region'); }} className="p-8 glass-apex rounded-3xl border border-white/5 hover:border-sky-400/50 text-white font-bold uppercase">{c}</button>
            ))}
          </div>
        )}
        {locStep === 'region' && selectedContinent && (
          <div className="space-y-4">
             {Object.keys(GEOGRAPHY[selectedContinent]).map(r => (
               <button key={r} onClick={() => { setSelectedRegion(r); setLocStep('country'); }} className="w-full p-6 glass-apex rounded-2xl border border-white/5 hover:border-sky-400/50 text-white text-left font-bold">{r}</button>
             ))}
          </div>
        )}
        {locStep === 'country' && selectedContinent && selectedRegion && (
          <div className="grid grid-cols-2 gap-4">
            {GEOGRAPHY[selectedContinent][selectedRegion].map((c: any) => (
              <button key={c.name} onClick={() => { updateField('country', c.name); updateField('currency', c.currency); nextStep(); }} className="p-6 glass-apex rounded-2xl border border-white/5 hover:border-sky-400/50 text-white text-left font-bold">{c.name} ({c.currency})</button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-10 border-t border-white/5">
        <input 
          type="text" 
          value={formData.name || ''} 
          onChange={(e) => updateField('name', e.target.value)} 
          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white text-center text-xl font-bold focus:border-sky-400 outline-none" 
          placeholder="Nom du Projet" 
        />
      </div>
    </div>
  );

  const renderStep2_Stage = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <Lightbulb className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold text-white uppercase">Maturité</h2>
      </div>
      <div className="space-y-4">
        {Object.values(BusinessStage).map(s => (
          <button key={s} onClick={() => { updateField('stage', s); nextStep(); }} className="w-full p-6 glass-apex rounded-2xl border border-white/5 hover:border-sky-400/50 text-white font-bold uppercase">{s}</button>
        ))}
      </div>
    </div>
  );

  const renderStep3_Type = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <Briefcase className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold text-white uppercase">Type</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(BusinessType).map(t => (
          <button key={t} onClick={() => { updateField('businessType', t); nextStep(); }} className="p-8 glass-apex rounded-3xl border border-white/5 hover:border-sky-400/50 text-white font-bold text-sm uppercase">{t}</button>
        ))}
      </div>
    </div>
  );

  const renderStep4_Collabs = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto text-center">
      <Users className="w-12 h-12 text-sky-400 mx-auto mb-4" />
      <h2 className="text-3xl font-display font-bold text-white uppercase">Collaborateurs</h2>
      <div className="flex gap-4">
        <input value={newCollab} onChange={(e) => setNewCollab(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-4 text-white" placeholder="Nom..." />
        <button onClick={() => { if(newCollab) { updateField('collaborators', [...(formData.collaborators || []), newCollab]); setNewCollab(''); } }} className="p-4 bg-sky-400 text-abyss rounded-xl font-black"><Plus /></button>
      </div>
      <div className="space-y-2">
        {formData.collaborators?.map((c, i) => <div key={i} className="p-4 glass-apex rounded-xl text-white flex justify-between">{c} <X className="cursor-pointer" onClick={() => { const l = [...(formData.collaborators || [])]; l.splice(i,1); updateField('collaborators', l); }} /></div>)}
      </div>
      <button onClick={nextStep} className="w-full py-5 bg-sky-400 text-abyss font-black rounded-2xl uppercase mt-8">Suivant</button>
    </div>
  );

  const renderStep5_Goal = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <Target className="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold text-white uppercase">Objectif</h2>
      </div>
      <textarea value={formData.mainGoal || ''} onChange={(e) => updateField('mainGoal', e.target.value)} className="w-full h-48 bg-slate-900 border border-white/10 rounded-[2rem] p-8 text-white text-lg focus:border-sky-400 outline-none" placeholder="Quelle est la mission ?" />
      <button onClick={handleFinish} className="w-full py-6 bg-sky-400 text-abyss font-black rounded-[2rem] text-xl uppercase tracking-widest shadow-2xl shadow-sky-500/20">Lancer la Mission</button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl glass-apex p-16 rounded-[4rem] border border-white/10">
        {step === 1 && renderStep1_Location()}
        {step === 2 && renderStep2_Stage()}
        {step === 3 && renderStep3_Type()}
        {step === 4 && renderStep4_Collabs()}
        {step === 5 && renderStep5_Goal()}
      </div>
    </div>
  );
};

export default OnboardingWorkflow;