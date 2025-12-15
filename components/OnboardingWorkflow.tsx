import React, { useState } from 'react';
import { UserProfile, BusinessStage, BusinessType } from '../types';
import { ArrowRight, Check, MapPin, Target, Briefcase, Lightbulb } from 'lucide-react';

interface OnboardingWorkflowProps {
  initialData: Partial<UserProfile>;
  onComplete: (fullProfile: UserProfile) => void;
}

const OnboardingWorkflow: React.FC<OnboardingWorkflowProps> = ({ initialData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...initialData,
    country: initialData.country || 'France',
  });

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);

  const handleFinish = () => {
    if (formData.name && formData.country) {
      onComplete(formData as UserProfile);
    }
  };

  const renderStep1_Location = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <MapPin className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Zone d'Opération</h2>
        <p className="text-slate-400 mt-2">Pour adapter la fiscalité, le droit et le marché.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {['France', 'Canada', 'Suisse', 'Belgique', 'Maroc', 'Sénégal', 'Côte d\'Ivoire', 'USA'].map(country => (
          <button
            key={country}
            onClick={() => { updateField('country', country); nextStep(); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              formData.country === country 
                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className="font-medium">{country}</div>
          </button>
        ))}
      </div>
      
      <div className="pt-4">
         <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Nom du Projet (Optionnel)</label>
         <input 
            type="text" 
            value={formData.businessName || ''}
            onChange={(e) => updateField('businessName', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            placeholder="Ex: MyStartup"
         />
      </div>
      
      <button onClick={nextStep} className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
        Suivant
      </button>
    </div>
  );

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

            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative">
                <div className="absolute top-4 right-4 opacity-50">
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