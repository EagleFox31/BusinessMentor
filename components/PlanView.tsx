import React from 'react';
import { PlanSection } from '../types';

interface PlanViewProps {
  activeSection: PlanSection;
  currency?: string;
}

const PlanView: React.FC<PlanViewProps> = ({ activeSection, currency = '€' }) => {
  // Mock content for demonstration - in a real app this is populated by the AI
  const renderContent = () => {
    switch (activeSection) {
      case PlanSection.IDEA_VALIDATION:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 border border-emerald-900/30 bg-emerald-950/10 rounded-lg">
              <h4 className="text-emerald-400 font-medium mb-2">Verdict Stratégique</h4>
              <p className="text-slate-300 text-sm">L'idée possède un potentiel élevé sur le marché local, mais la barrière à l'entrée technologique est sous-estimée. Nécessite un MVP (Produit Minimum Viable) sous 3 mois pour valider l'appétence client sans brûler le capital.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">Hypothèses Fondamentales</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Le marché cible est prêt à payer pour une solution premium.</li>
                <li>Le coût d'acquisition client (CAC) restera sous les 15{currency}.</li>
                <li>La réglementation locale permet ce type de service sans licence bancaire.</li>
              </ul>
            </div>
          </div>
        );
      case PlanSection.BUSINESS_MODEL:
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Proposition de Valeur</h4>
                    <p className="text-slate-200">Une plateforme tout-en-un simplifiant la bureaucratie pour les créatifs, permettant de gagner 10h/semaine.</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Segments Clients</h4>
                    <p className="text-slate-200">Freelances, Designers, Consultants indépendants (CA 30k{currency} - 150k{currency}).</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Flux de Revenus</h4>
                    <p className="text-slate-200">Abonnement SaaS (29{currency}/mois) + Frais de transaction (1.5%).</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Structure de Coûts</h4>
                    <p className="text-slate-200">Hébergement Cloud, Support Client, Développement R&D.</p>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>Contenu en cours d'élaboration avec le mentor...</p>
            <p className="text-xs mt-2">Discutez dans le chat pour remplir cette section.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">{activeSection}</h2>
        <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
      </div>
      {renderContent()}
    </div>
  );
};

export default PlanView;