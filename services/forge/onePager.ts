
import { Project, UserProfile, AgencyType } from "../../types";

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

/**
 * Heuristique d'inférence du type d'agence pour le One-Pager.
 */
export function inferAgencyType(project: Project): AgencyType {
  const blob = [
    project.name,
    project.offer,
    project.description,
    project.problem,
    project.icp,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bpentest\b|\bsoc\b|\bsiem\b|\bvuln|\biso ?27001\b|\baudit\b/.test(blob)) return "CYBERSECURITY";
  if (/\bdata\b|\bbi\b|\betl\b|\bml\b|\bai\b|\brag\b|\bmodel\b|\bvector\b/.test(blob)) return "DATA_AI";
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bcampagne\b/.test(blob)) return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bcharte graphique\b|\bbranding\b/.test(blob)) return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob)) return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob)) return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob)) return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bapplication\b|\bapi\b|\bmaintenance\b|\bdelivery\b/.test(blob)) return "DEV_ESN";

  return "UNKNOWN";
}

type Specializer = (project: Project) => string;

const specializeDevEsn: Specializer = () => `
ANGLES AGENCE DEV/ESN (à intégrer dans les sections) :
- Fracture marché : délais, qualité, dette technique, coûts cachés, manque de delivery discipline.
- Thèse : marge par packaging (Discovery/Build/Maintain), récurrence via retainer/SLA, standardisation.
- Barrières : playbooks de delivery, QA gates, composants réutilisables, vitesse d’exécution, preuves (portfolio).
- Architecture : process + stack + gouvernance + sécurité by default.
`.trim();

const specializeDataAI: Specializer = () => `
ANGLES AGENCE DATA/IA :
- Fracture : décisions sans data fiable, silos, reporting lent, coût des erreurs.
- Thèse : gains ROI (temps, fraude/erreurs, performance), MRR via data ops/monitoring, upsell IA.
- Barrières : gouvernance données, pipelines robustes, qualité + traçabilité, expertise métier, sécurité.
- Architecture : ingestion → transformation → BI/IA → monitoring → adoption.
`.trim();

const specializeCyber: Specializer = () => `
ANGLES AGENCE CYBERSÉCURITÉ :
- Fracture : augmentation du risque, faible maturité, exigences clients/partenaires, incidents coûteux.
- Thèse : revenus récurrents (SOC, audits, GRC), valeur = réduction du risque + conformité.
- Barrières : méthodo, règles d’engagement, tooling, crédibilité, process de preuve, confidentialité.
- Architecture : prévention → détection → réponse → amélioration (SOP/Runbooks).
`.trim();

const specializeMarketing: Specializer = () => `
ANGLES AGENCE MARKETING/COMM :
- Fracture : CAC qui explose, tracking instable, contenus génériques, manque de conversion.
- Thèse : performance (ROAS, leads qualifiés), récurrence (retainer), différenciation par data & brand safety.
- Barrières : framework créa + data, process test&learn, assets ownership, expertise verticalisée.
- Architecture : stratégie → création → diffusion → mesure → itérations.
`.trim();

const specializeDesign: Specializer = () => `
ANGLES AGENCE DESIGN/BRANDING :
- Fracture : expérience utilisateur négligée, incohérences de marque, conversion faible.
- Thèse : impact mesurable (conversion, adoption, support réduit), récurrence via design ops.
- Barrières : système de design, qualité UX, accessibilité, méthodologie, rapidité de prototypage.
- Architecture : research → design system → delivery → QA UX.
`.trim();

const specializeConsulting: Specializer = () => `
ANGLES AGENCE CONSEIL/STRATÉGIE :
- Fracture : organisations lentes, process non maîtrisés, décisions sans gouvernance.
- Thèse : valeur = réduction coûts/délais + meilleure exécution, récurrence via PMO/AMOA/ops.
- Barrières : frameworks, gouvernance, capacité d’alignement, livraison de décisions applicables.
- Architecture : diagnostic → design cible → plan → pilotage → transfert.
`.trim();

const specializeTraining: Specializer = () => `
ANGLES AGENCE FORMATION/EDTECH :
- Fracture : gap de compétences, formations théoriques, faible employabilité.
- Thèse : revenus par cohortes + B2B, récurrence via abonnements contenus + coaching.
- Barrières : pédagogie projet, contenus propriétaires, évaluation, communauté, partenariats.
- Architecture : parcours → projets → évaluation → certification/portfolio.
`.trim();

const specializeHR: Specializer = () => `
ANGLES AGENCE RH/RECRUTEMENT :
- Fracture : pénurie talents, recrutement lent, mauvais matching, churn.
- Thèse : fees + abonnements, valeur = time-to-hire réduit + qualité matching.
- Barrières : réseau, process, scoring, compliance, expérience candidat.
- Architecture : sourcing → qualification → matching → suivi.
`.trim();

const specializeUnknown: Specializer = () => `
ANGLES TYPE INCONNU :
- Rester générique + ajouter des "À préciser" ciblés (cible, offre, modèle, différenciation, preuves).
`.trim();

const SPECIALIZERS: Record<AgencyType, Specializer> = {
  DEV_ESN: specializeDevEsn,
  DATA_AI: specializeDataAI,
  CYBERSECURITY: specializeCyber,
  MARKETING_COMM: specializeMarketing,
  DESIGN_BRANDING: specializeDesign,
  CONSULTING_STRATEGY: specializeConsulting,
  TRAINING_EDTECH: specializeTraining,
  HR_RECRUITING: specializeHR,
  UNKNOWN: specializeUnknown,
};

export const getOnePagerPrompt = (
  project: Project,
  user: UserProfile,
  agencyType?: AgencyType
): string => {
  const type = agencyType ?? project.agencyType ?? inferAgencyType(project);
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
Tu es Partner Senior en stratégie du cabinet Trigenys.
Rédige un "Concept One-Pager" institutionnel, niveau Executive Summary.

DATE D'ÉMISSION : ${currentDate} (utilise cette date précise dans le document)
PROJET : ${escape(project.name)}
PAYS : ${escape(project.country)}
VISION : ${escape(project.mainGoal)}

CONTEXTE (source de vérité) :
- Offre / services : ${escape(project.offer)}
- ICP / clients : ${escape(project.icp)}
- Problème adressé : ${escape(project.problem)}
- Différenciation : ${escape(project.differentiation)}
- Modèle de revenus : ${escape(project.revenueModel)}
- Contraintes : ${escape(project.constraints)}
- Preuves / traction : ${escape(project.proof)}

TYPE D’AGENCE : ${type}
${SPECIALIZERS[type](project)}

RÈGLES ANTI-HALLUCINATION :
- N’invente pas de faits (chiffres, lois, parts de marché). Si info manquante : écris "À préciser".
- Pas de storytelling. Pas de marketing. Ton incisif, sans fioritures.
- Objectif "ONE-PAGER" : maximum ~450–650 mots.

RÈGLES DE FORMATAGE (strict) :
- Utilise exclusivement "## " pour les titres de sections.
- Utilise exclusivement "### " pour les sous-titres.
- Utilise des listes à puces "- " pour les points clés.
- Chaque section = 4 à 6 puces max. Chaque sous-titre = 2 à 4 puces max.

STRUCTURE À SUIVRE :

## LE RATIONNEL STRATÉGIQUE
### Fracture du marché en ${escape(project.country)}
### Pourquoi maintenant
### Ce qui se passe si on ne fait rien

## LA THÈSE D'INVESTISSEMENT
### Leviers de rentabilité (unit economics)
### Barrières à l’entrée
### Avantage compétitif défendable

## ARCHITECTURE DE LA SOLUTION
### Mécanique de la solution
### Ce qui change concrètement pour le client (avant/après)
### Risques majeurs & parades (3 max)

## FEUILLE DE ROUTE OPÉRATIONNELLE
### Jalon 1 (Mois 3) : Infrastructure core
### Jalon 2 (Mois 6) : Acquisition / Delivery
### Jalon 3 (Mois 12) : Break-even & Scale
### Points à préciser (si nécessaire)

STYLE : incisif, grade "Executive Summary".
`.trim();
};
