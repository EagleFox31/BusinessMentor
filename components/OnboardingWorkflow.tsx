
import React, { useState } from 'react';
import { UserProfile, BusinessStage, BusinessType } from '../types';
import { ArrowRight, Check, MapPin, Target, Briefcase, Lightbulb, ChevronLeft, Globe, Zap, Compass, Users, Plus, X } from 'lucide-react';

interface CountryData {
  name: string;
  currency: string;
}

interface RegionData {
  [regionName: string]: CountryData[];
}

interface GeographyData {
  [continentName: string]: RegionData;
}

interface OnboardingWorkflowProps {
  initialData: Partial<UserProfile>;
  onComplete: (fullProfile: UserProfile) => void;
}

const GEOGRAPHY: GeographyData = {
  "Afrique": {
    "Afrique de l'Ouest": [
      { name: "Côte d'Ivoire", currency: "XOF" },
      { name: "Sénégal", currency: "XOF" },
      { name: "Bénin", currency: "XOF" },
      { name: "Burkina Faso", currency: "XOF" },
      { name: "Mali", currency: "XOF" },
      { name: "Togo", currency: "XOF" },
      { name: "Guinée", currency: "GNF" },
      { name: "Nigéria", currency: "NGN" }
    ],
    "Afrique Centrale": [
      { name: "Cameroun", currency: "XAF" },
      { name: "Gabon", currency: "XAF" },
      { name: "Congo (Brazzaville)", currency: "XAF" },
      { name: "RDC", currency: "CDF" },
      { name: "Tchad", currency: "XAF" }
    ],
    "Afrique du Nord": [
      { name: "Maroc", currency: "MAD" },
      { name: "Algérie", currency: "DZD" },
      { name: "Tunisie", currency: "TND" },
      { name: "Égypte", currency: "EGP" }
    ],
    "Afrique de l'Est": [
        { name: "Kenya", currency: "KES" },
        { name: "Rwanda", currency: "RWF" },
        { name: "Tanzanie", currency: "TZS" },
        { name: "Éthiopie", currency: "ETB" }
    ],
    "Afrique Australe": [
        { name: "Afrique du Sud", currency: "ZAR" },
        { name: "Madagascar", currency: "MGA" }
    ]
  },
  "Europe": {
    "Europe de l'Ouest": [
      { name: "France", currency: "EUR" },
      { name: "Belgique", currency: "EUR" },
      { name: "Suisse", currency: "CHF" },
      { name: "Luxembourg", currency: "EUR" }
    ],
    "Europe du Sud": [
        { name: "Espagne", currency: "EUR" },
        { name: "Italie", currency: "EUR" },
        { name: "Portugal", currency: "EUR" }
    ],
    "Royaume-Uni & Irlande": [
        { name: "Royaume-Uni", currency: "GBP" },
        { name: "Irlande", currency: "EUR" }
    ]
  },
  "Amérique du Nord": {
    "Amérique du Nord": [
      { name: "Canada", currency: "CAD" },
      { name: "États-Unis", currency: "USD" }
    ]
  }
};

const OnboardingWorkflow: React.FC<OnboardingWorkflowProps> = ({ initialData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...initialData,
    country: initialData.country || '',
    currency: initialData.currency || 'EUR',
    collaborators: []
  });

  const [locStep, setLocStep] = useState<'continent' | 'region' | 'country'>('continent');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [newCollab, setNewCollab] = useState('');

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = () => {
    if (formData.name && formData.country) {
      onComplete(formData as UserProfile);
    }
  };

  const addCollaborator = () => {
    if (newCollab.trim()) {
      updateField('collaborators', [...(formData.collaborators || []), newCollab.trim()]);
      setNewCollab('');
    }
  };

  const removeCollaborator = (index: number) => {
    const list = [...(formData.collaborators || [])];
    list.splice(index, 1);
    updateField('collaborators', list);
  };

  const renderStep1_Location = () => {
    const handleContinentSelect = (continent: string) => {
        setSelectedContinent(continent);
        setLocStep('region');
    };
    const handleRegionSelect = (region: string) => {
        setSelectedRegion(region);
        setLocStep('country');
    };
    const handleCountrySelect = (country: CountryData) => {
        updateField('country', country.name);
        updateField('currency', country.currency);
        nextStep();
    };
    const backToContinent = () => { setSelectedContinent(null); setLocStep('continent'); };
    const backToRegion = () => { setSelectedRegion(null); setLocStep('region'); };

    return (
        <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
                <Compass className="w-8 h-8 text-apex-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Secteur Tactique</h2>
            <p className="text-slate-500 mt-2 font-medium">Verrouillage des coordonnées d'impact.</p>
          </div>

          <div className="min-h-[280px]">
            {locStep === 'continent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(GEOGRAPHY).map(continent => (
                        <button 
                          key={continent} 
                          onClick={() => handleContinentSelect(continent)} 
                          className="group p-8 rounded-[2rem] border border-white/5 bg-slate-900/40 hover:bg-apex-400/10 hover:border-apex-400/50 transition-all duration-300 text-center flex flex-col items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-abyss flex items-center justify-center border border-white/5 group-hover:border-apex-400/30 transition-all">
                               <Globe className="w-5 h-5 text-slate-600 group-hover:text-apex-400" />
                            </div>
                            <span className="font-display font-bold text-slate-200 uppercase tracking-widest text-sm">{continent}</span>
                        </button>
                    ))}
                </div>
            )}
            {locStep === 'region' && selectedContinent && (
                <div className="space-y-6">
                    <button onClick={backToContinent} className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour Continents
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {Object.keys(GEOGRAPHY[selectedContinent]).map(region => (
                            <button 
                              key={region} 
                              onClick={() => handleRegionSelect(region)} 
                              className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-apex-400/10 hover:border-apex-400/50 text-left transition-all flex justify-between items-center group"
                            >
                                <span className="font-bold text-slate-200">{region}</span>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-apex-400 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {locStep === 'country' && selectedContinent && selectedRegion && (
                <div className="space-y-6">
                     <button onClick={backToRegion} className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour Régions
                    </button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {GEOGRAPHY[selectedContinent][selectedRegion].map(country => (
                            <button 
                              key={country.name} 
                              onClick={() => handleCountrySelect(country)} 
                              className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-apex-400/5 hover:border-apex-400/50 text-left transition-all group flex flex-col gap-3"
                            >
                                <div className="font-bold text-slate-200 text-sm line-clamp-1">{country.name}</div>
                                <div className="text-[10px] font-black text-slate-600 flex items-center gap-2 uppercase tracking-tighter">
                                    <Zap className="w-3 h-3 text-apex-400/50" /> {country.currency}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <div className="pt-10 border-t border-white/5">
             <div className="flex flex-col gap-4 max-w-md mx-auto">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">Nom du Projet Stratégique</label>
                <input 
                    type="text" 
                    value={formData.businessName || ''}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className="w-full bg-slate-900/40 border border-white/10 rounded-2xl p-5 text-white focus:border-apex-400 outline-none placeholder-slate-800 font-bold backdrop-blur-sm text-center text-xl tracking-tight"
                    placeholder="Ex: Projet Horus"
                />
             </div>
          </div>
        </div>
    );
  };

  const renderStep2_Stage = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Lightbulb className="w-8 h-8 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Maturité de Mission</h2>
        <p className="text-slate-500 mt-2 font-medium">Évaluation de l'altitude opérationnelle.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.values(BusinessStage).map(stage => (
          <button
            key={stage}
            onClick={() => { updateField('stage', stage); nextStep(); }}
            className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              formData.stage === stage 
                ? 'bg-apex-400/10 border-apex-400 text-apex-400 shadow-lg shadow-apex-500/10' 
                : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-apex-400/30'
            }`}
          >
            <span className="font-bold text-lg uppercase tracking-tight">{stage}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.stage === stage ? 'border-apex-400 bg-apex-400' : 'border-slate-800'}`}>
               {formData.stage === stage && <Check className="w-4 h-4 text-abyss" />}
            </div>
          </button>
        ))}
      </div>
      <button onClick={prevStep} className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
        <ChevronLeft className="w-3 h-3" /> Retour Localisation
      </button>
    </div>
  );

  const renderStep3_Type = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Briefcase className="w-8 h-8 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Structure de l'Actif</h2>
        <p className="text-slate-500 mt-2 font-medium">Définition de la cellule d'affaires.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(BusinessType).map(type => (
          <button
            key={type}
            onClick={() => { updateField('businessType', type); nextStep(); }}
            className={`w-full p-8 rounded-3xl border flex flex-col items-center gap-4 text-center transition-all duration-300 ${
              formData.businessType === type 
                ? 'bg-apex-400/10 border-apex-400 text-apex-400 shadow-lg shadow-apex-500/10' 
                : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-apex-400/30 hover:bg-slate-900'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${formData.businessType === type ? 'border-apex-400 bg-apex-400/20' : 'border-slate-800 bg-abyss'}`}>
               <Target className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">{type}</span>
          </button>
        ))}
      </div>
      <button onClick={prevStep} className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
        <ChevronLeft className="w-3 h-3" /> Retour Maturité
      </button>
    </div>
  );

  const renderStep4_Collaborators = () => (
    <div className="space-y-12 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Users className="w-8 h-8 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Cellule Commando</h2>
        <p className="text-slate-500 mt-2 font-medium">Qui sont vos co-pilotes de mission ?</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
           <input 
              type="text"
              value={newCollab}
              onChange={(e) => setNewCollab(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
              className="flex-1 bg-slate-900/40 border border-white/10 rounded-2xl p-5 text-white focus:border-apex-400 outline-none placeholder-slate-800 font-bold"
              placeholder="Nom du co-collaborateur"
           />
           <button 
             onClick={addCollaborator}
             className="p-5 bg-apex-400 text-abyss rounded-2xl font-black hover:bg-white transition-all shadow-xl shadow-apex-500/20"
           >
             <Plus className="w-6 h-6" />
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[100px]">
           {(formData.collaborators || []).map((collab, idx) => (
             <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl group">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                   <span className="text-white font-bold">{collab}</span>
                </div>
                <button onClick={() => removeCollaborator(idx)} className="text-slate-700 hover:text-red-400 transition-colors">
                   <X className="w-4 h-4" />
                </button>
             </div>
           ))}
           {(!formData.collaborators || formData.collaborators.length === 0) && (
             <div className="col-span-full py-8 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest border border-dashed border-white/5 rounded-2xl italic">
               Agent Solo — Aucune cellule détectée
             </div>
           )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 pt-6">
        <button onClick={prevStep} className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
          <ChevronLeft className="w-3 h-3" /> Retour Structure
        </button>
        <button 
          onClick={nextStep}
          className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl border border-white/10 hover:border-apex-400/50 transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl"
        >
          Valider Cellule <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep5_Goal = () => (
    <div className="space-y-10 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Target className="w-8 h-8 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Point d'Impact</h2>
        <p className="text-slate-500 mt-2 font-medium">Spécification de l'objectif critique.</p>
      </div>

      <div className="relative">
          <textarea 
            className="w-full bg-slate-900/40 border border-white/10 rounded-[2.5rem] p-8 text-white focus:border-apex-400 outline-none h-48 resize-none text-lg font-medium placeholder-slate-800 backdrop-blur-sm shadow-inner"
            placeholder="Décrivez votre vision de capture de valeur..."
            value={formData.mainGoal || ''}
            onChange={(e) => updateField('mainGoal', e.target.value)}
          />
          <div className="absolute bottom-6 right-8 text-[9px] font-black text-slate-700 uppercase tracking-widest">
             Input Ready / Mode Alpha
          </div>
      </div>

      <div className="flex flex-col gap-6">
        <button 
          onClick={handleFinish}
          className="w-full py-6 bg-apex-400 text-abyss font-black rounded-3xl shadow-2xl shadow-apex-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-[0.2em]"
        >
          INITIALISER LE COCKPIT <ArrowRight className="w-6 h-6" />
        </button>
        <button onClick={prevStep} className="text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors">
          <ChevronLeft className="w-3 h-3" /> Retour Cellule
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="w-full max-w-5xl z-10">
            {/* Progress Visualization */}
            <div className="flex items-center justify-between mb-12 px-12">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-1 flex items-center">
                        <div className={`h-[1px] flex-1 rounded-full transition-all duration-1000 ${step > i ? 'bg-apex-400 apex-glow' : 'bg-white/5'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full mx-4 transition-all duration-500 border border-white/10 ${step >= i ? 'bg-apex-400 apex-glow scale-125' : 'bg-slate-900'}`}></div>
                        {i === 5 && <div className="h-[1px] flex-1"></div>}
                    </div>
                ))}
            </div>

            <div className="glass-apex p-16 rounded-[4rem] border border-white/10 shadow-2xl relative min-h-[650px] flex flex-col justify-center backdrop-blur-xl">
                {/* Branding Signature Subtile */}
                <div className="absolute top-12 right-12 flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-apex-400 rounded-full animate-pulse"></div>
                     <span className="font-signature text-2xl text-white">Apex Horus</span>
                   </div>
                   <div className="trigenys-signature text-[6px] -mt-1 flex items-center gap-1">
                     <span className="font-signature text-xl text-sky-400/80 italic lowercase tracking-normal">by</span>
                     TRIGENYS INFRASTRUCTURE
                   </div>
                </div>

                {step === 1 && renderStep1_Location()}
                {step === 2 && renderStep2_Stage()}
                {step === 3 && renderStep3_Type()}
                {step === 4 && renderStep4_Collaborators()}
                {step === 5 && renderStep5_Goal()}
            </div>
            
            <div className="mt-12 text-center">
               <div className="trigenys-signature text-[9px] text-slate-700/40 justify-center">
                 ESTABLISHED 2024 — GLOBAL STRATEGIC NODE — TRIGENYS GROUP
               </div>
            </div>
        </div>
    </div>
  );
};

export default OnboardingWorkflow;
