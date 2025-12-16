import React, { useState } from 'react';
import { UserProfile, BusinessStage, BusinessType } from '../types';
import { ArrowRight, Check, MapPin, Target, Briefcase, Lightbulb, ChevronLeft, Globe } from 'lucide-react';

interface OnboardingWorkflowProps {
  initialData: Partial<UserProfile>;
  onComplete: (fullProfile: UserProfile) => void;
}

// Data Structure for Geography
type CountryData = { name: string; currency: string };
type RegionData = { [regionName: string]: CountryData[] };
type GeographyData = { [continentName: string]: RegionData };

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

  // Location Selector State
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

  // --- Step 1: Hierarchical Location Selection ---
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

    const backToContinent = () => {
        setSelectedContinent(null);
        setLocStep('continent');
    };

    const backToRegion = () => {
        setSelectedRegion(null);
        setLocStep('region');
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <MapPin className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Juridiction & Devise</h2>
            <p className="text-slate-400 mt-2">
                {locStep === 'continent' && "Sélectionnez votre continent."}
                {locStep === 'region' && `Zone en ${selectedContinent}.`}
                {locStep === 'country' && `Pays en ${selectedRegion}.`}
            </p>
          </div>

          <div className="min-h-[300px]">
            {/* CONTINENTS */}
            {locStep === 'continent' && (
                <div className="grid grid-cols-1 gap-3">
                    {Object.keys(GEOGRAPHY).map(continent => (
                        <button
                            key={continent}
                            onClick={() => handleContinentSelect(continent)}
                            className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 text-left transition-all flex justify-between items-center group"
                        >
                            <span className="font-medium text-slate-200">{continent}</span>
                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                        </button>
                    ))}
                </div>
            )}

            {/* REGIONS */}
            {locStep === 'region' && selectedContinent && (
                <div className="space-y-4">
                    <button onClick={backToContinent} className="flex items-center text-xs text-slate-500 hover:text-white mb-2">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour aux continents
                    </button>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.keys(GEOGRAPHY[selectedContinent]).map(region => (
                            <button
                                key={region}
                                onClick={() => handleRegionSelect(region)}
                                className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 text-left transition-all flex justify-between items-center group"
                            >
                                <span className="font-medium text-slate-200">{region}</span>
                                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* COUNTRIES */}
            {locStep === 'country' && selectedContinent && selectedRegion && (
                <div className="space-y-4">
                     <button onClick={backToRegion} className="flex items-center text-xs text-slate-500 hover:text-white mb-2">
                        <ChevronLeft className="w-3 h-3 mr-1" /> Retour aux zones ({selectedContinent})
                    </button>
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {GEOGRAPHY[selectedContinent][selectedRegion].map(country => (
                            <button
                                key={country.name}
                                onClick={() => handleCountrySelect(country)}
                                className="p-3 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-emerald-950/30 hover:border-emerald-500 text-left transition-all group"
                            >
                                <div className="font-medium text-slate-200 text-sm">{country.name}</div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {country.currency}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-800">
             <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Nom du Projet (Optionnel)</label>
             <input 
                type="text" 
                value={formData.businessName || ''}
                onChange={(e) => updateField('businessName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none placeholder-slate-600"
                placeholder="Ex: MyStartup"
             />
          </div>
        </div>
    );
  };

  const renderStep2_Stage = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Lightbulb className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Stade d'Avancement</h2>
        <p className="text-slate-400 mt-2">Où en êtes-vous dans votre parcours ?</p>
      </div>

      <div className="space-y-3">
        {Object.values(BusinessStage).map(stage => (
          <button
            key={stage}
            onClick={() => { updateField('stage', stage); nextStep(); }}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
              formData.stage === stage 
                ? 'bg-amber-950/20 border-amber-500/50 text-amber-200' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="font-medium">{stage}</span>
            {formData.stage === stage && <Check className="w-5 h-5 text-amber-500" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3_Type = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Briefcase className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Modèle d'Affaires</h2>
        <p className="text-slate-400 mt-2">Quel type de structure bâtissons-nous ?</p>
      </div>

      <div className="space-y-3">
        {Object.values(BusinessType).map(type => (
          <button
            key={type}
            onClick={() => { updateField('businessType', type); nextStep(); }}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
              formData.businessType === type 
                ? 'bg-blue-950/20 border-blue-500/50 text-blue-200' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="font-medium">{type}</span>
            {formData.businessType === type && <Check className="w-5 h-5 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4_Goal = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Target className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Objectif Principal</h2>
        <p className="text-slate-400 mt-2">Quelle est la priorité immédiate ?</p>
      </div>

      <textarea 
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none h-32 resize-none"
        placeholder="Ex: Valider mon idée sans dépenser d'argent, ou lever 500k€ en 6 mois..."
        value={formData.mainGoal || ''}
        onChange={(e) => updateField('mainGoal', e.target.value)}
      />

      <button 
        onClick={handleFinish}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
      >
        Entrer dans le Dashboard <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-lg z-10">
            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-12 gap-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-emerald-500' : 'w-4 bg-slate-800'}`}></div>
                ))}
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative min-h-[500px]">
                <div className="absolute top-4 right-4 opacity-50 flex items-center gap-1">
                   <span className="font-['Pinyon_Script'] text-xl text-emerald-500">Trigenys</span>
                </div>

                {step === 1 && renderStep1_Location()}
                {step === 2 && renderStep2_Stage()}
                {step === 3 && renderStep3_Type()}
                {step === 4 && renderStep4_Goal()}
            </div>
        </div>
    </div>
  );
};

export default OnboardingWorkflow;