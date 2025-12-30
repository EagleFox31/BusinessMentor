
import React, { useState } from 'react';
import { UserProfile, BusinessStage, BusinessType } from '../types';
import { ArrowRight, Check, MapPin, Target, Briefcase, Lightbulb, ChevronLeft, Globe, Zap } from 'lucide-react';

// Define missing types for geography data structure
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

// Global data for geography selection
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
    currency: initialData.currency || 'EUR'
  });

  const [locStep, setLocStep] = useState<'continent' | 'region' | 'country'>('continent');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);

  const handleFinish = () => {
    if (formData.name && formData.country) {
      onComplete(formData as UserProfile);
    }
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
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
                <MapPin className="w-10 h-10 text-apex-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Zone d'Opération</h2>
            <p className="text-slate-500 mt-2 font-medium">Calibrage géo-stratégique by Trigenys Group.</p>
          </div>

          <div className="min-h-[300px]">
            {locStep === 'continent' && (
                <div className="grid grid-cols-1 gap-3">
                    {Object.keys(GEOGRAPHY).map(continent => (
                        <button key={continent} onClick={() => handleContinentSelect(continent)} className="p-5 rounded-2xl border border-white/5 glass-apex hover:border-apex-400/50 text-left transition-all flex justify-between items-center group">
                            <span className="font-bold text-slate-200">{continent}</span>
                            <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-apex-400" />
                        </button>
                    ))}
                </div>
            )}
            {locStep === 'region' && selectedContinent && (
                <div className="space-y-4">
                    <button onClick={backToContinent} className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour Continent
                    </button>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.keys(GEOGRAPHY[selectedContinent]).map(region => (
                            <button key={region} onClick={() => handleRegionSelect(region)} className="p-5 rounded-2xl border border-white/5 glass-apex hover:border-apex-400/50 text-left transition-all flex justify-between items-center group">
                                <span className="font-bold text-slate-200">{region}</span>
                                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-apex-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {locStep === 'country' && selectedContinent && selectedRegion && (
                <div className="space-y-4">
                     <button onClick={backToRegion} className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour Zone
                    </button>
                    <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {GEOGRAPHY[selectedContinent][selectedRegion].map(country => (
                            <button key={country.name} onClick={() => handleCountrySelect(country)} className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-apex-400/5 hover:border-apex-400/50 text-left transition-all group">
                                <div className="font-bold text-slate-200 text-sm">{country.name}</div>
                                <div className="text-[10px] font-black text-slate-600 mt-2 flex items-center gap-2 uppercase tracking-tighter">
                                    <Globe className="w-3 h-3 text-apex-400/50" /> {country.currency}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <div className="pt-8 border-t border-white/5">
             <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Nom du Projet</label>
             <input 
                type="text" 
                value={formData.businessName || ''}
                onChange={(e) => updateField('businessName', e.target.value)}
                className="w-full bg-slate-900/40 border border-white/10 rounded-2xl p-4 text-white focus:border-apex-400 outline-none placeholder-slate-800 font-bold backdrop-blur-sm"
                placeholder="Ex: Projet Apex"
             />
          </div>
        </div>
    );
  };

  const renderStep2_Stage = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Lightbulb className="w-10 h-10 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Altitude Actuelle</h2>
        <p className="text-slate-500 mt-2 font-medium">Mesure de maturité by Trigenys Group.</p>
      </div>

      <div className="space-y-4">
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
            <span className="font-bold text-lg">{stage}</span>
            {formData.stage === stage && <Check className="w-6 h-6 text-apex-400" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3_Type = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Briefcase className="w-10 h-10 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Architecture</h2>
        <p className="text-slate-500 mt-2 font-medium">Classification structurelle Trigenys.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.values(BusinessType).map(type => (
          <button
            key={type}
            onClick={() => { updateField('businessType', type); nextStep(); }}
            className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              formData.businessType === type 
                ? 'bg-apex-400/10 border-apex-400 text-apex-400 shadow-lg shadow-apex-500/10' 
                : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-apex-400/30'
            }`}
          >
            <span className="font-bold text-lg">{type}</span>
            {formData.businessType === type && <Check className="w-6 h-6 text-apex-400" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4_Goal = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-apex-400/20 shadow-xl shadow-apex-500/5">
            <Target className="w-10 h-10 text-apex-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Cible Prioritaire</h2>
        <p className="text-slate-500 mt-2 font-medium">Définition de la mission critique Apex.</p>
      </div>

      <textarea 
        className="w-full bg-slate-900/40 border border-white/10 rounded-3xl p-6 text-white focus:border-apex-400 outline-none h-40 resize-none text-lg font-medium placeholder-slate-800 backdrop-blur-sm"
        placeholder="Décrivez votre objectif de capture de marché..."
        value={formData.mainGoal || ''}
        onChange={(e) => updateField('mainGoal', e.target.value)}
      />

      <button 
        onClick={handleFinish}
        className="w-full py-6 bg-apex-400 text-abyss font-black rounded-2xl shadow-2xl shadow-apex-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 text-lg"
      >
        INITIALISER LE COCKPIT <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="w-full max-w-xl z-10">
            {/* Progress Visualization */}
            <div className="flex items-center justify-between mb-16 px-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 flex items-center">
                        <div className={`h-[2px] flex-1 rounded-full transition-all duration-1000 ${step > i ? 'bg-apex-400 gold-glow' : 'bg-white/5'}`}></div>
                        <div className={`w-3 h-3 rounded-full mx-3 transition-all duration-500 ${step >= i ? 'bg-apex-400 gold-glow scale-125' : 'bg-slate-800'}`}></div>
                        {i === 4 && <div className="h-[2px] flex-1"></div>}
                    </div>
                ))}
            </div>

            <div className="glass-apex p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative min-h-[600px] flex flex-col justify-center backdrop-blur-md">
                <div className="absolute top-8 right-10 flex flex-col items-end opacity-40">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-apex-400 rounded-full"></div>
                     <span className="font-signature text-xl text-white">Apex Vision</span>
                   </div>
                   <span className="text-[7px] font-black text-apex-400 uppercase tracking-widest -mt-1">by Trigenys Group</span>
                </div>

                {step === 1 && renderStep1_Location()}
                {step === 2 && renderStep2_Stage()}
                {step === 3 && renderStep3_Type()}
                {step === 4 && renderStep4_Goal()}
            </div>
            
            <div className="mt-8 text-center">
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">by Trigenys Group Global Infrastructure</span>
            </div>
        </div>
    </div>
  );
};

export default OnboardingWorkflow;
