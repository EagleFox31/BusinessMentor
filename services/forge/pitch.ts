
import { Project, UserProfile, AgencyType } from "../../types";

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

/**
 * Heuristique d'inférence du type d'agence pour le Pitch.
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
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bcampagne\b/.test(blob))
    return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bbranding\b|\bcharte graphique\b/.test(blob)) return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob)) return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob)) return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob))
    return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bapplication\b|\bapi\b|\bmaintenance\b|\bdelivery\b/.test(blob)) return "DEV_ESN";

  return "UNKNOWN";
}

type Specializer = (project: Project) => string;

const specializeDevEsn: Specializer = () => `
PITCH ANGLE — DEV/ESN :
- Douleur : projets en retard, bugs, dette technique, coûts cachés.
- Promesse : delivery discipliné, qualité mesurée, time-to-value réduit.
- Mécanique cash : packages (Discovery/Build/Maintain), retainer, SLA.
- Scalable : réutilisation composants + playbooks + industrialisation.
`.trim();

const specializeDataAI: Specializer = () => `
PITCH ANGLE — DATA/IA :
- Douleur : décisions aveugles, reporting lent, données sales.
- Promesse : pipelines fiables + dashboards + IA utile (pas gadget).
- Cash : implémentation + abonnement data ops/monitoring + upsell modèles.
- Scalable : templates pipelines + connecteurs + méthodo gouvernance.
`.trim();

const specializeCyber: Specializer = () => `
PITCH ANGLE — CYBERSÉCURITÉ :
- Douleur : risque qui explose, incidents chers, faible maturité.
- Promesse : prévention/détection/réponse avec process + preuve + confidentialité.
- Cash : audits, pentest, SOC managé, GRC récurrent.
- Scalable : runbooks + tooling + offres packagées par maturité.
`.trim();

const specializeMarketing: Specializer = () => `
PITCH ANGLE — MARKETING/COMM :
- Douleur : CAC élevé, contenu qui ne convertit pas, tracking fragile.
- Promesse : performance mesurée + créa qui vend + brand safety.
- Cash : retainer + campagnes + production + bonus perf (si applicable).
- Scalable : système test&learn + templates créa + data.
`.trim();

const specializeDesign: Specializer = () => `
PITCH ANGLE — DESIGN/BRANDING :
- Douleur : UX médiocre, adoption faible, marque incohérente.
- Promesse : design system + UX orientée conversion/adoption.
- Cash : audit UX, refonte, design ops récurrent.
- Scalable : design system réutilisable + process research → delivery.
`.trim();

const specializeConsulting: Specializer = () => `
PITCH ANGLE — CONSEIL/STRATÉGIE :
- Douleur : organisation lente, décisions floues, exécution chaotique.
- Promesse : diagnostic → plan → pilotage → transfert, sans blabla.
- Cash : missions cadrées + PMO/AMOA récurrent.
- Scalable : frameworks + assets + playbooks + verticalisation.
`.trim();

const specializeTraining: Specializer = () => `
PITCH ANGLE — FORMATION/EDTECH :
- Douleur : formation théorique, faible employabilité.
- Promesse : parcours projet + portfolio + coaching.
- Cash : cohortes + B2B + abonnements contenus.
- Scalable : contenus modulaires + plateformes + mentors.
`.trim();

const specializeHR: Specializer = () => `
PITCH ANGLE — RH/RECRUTEMENT :
- Douleur : time-to-hire long, mauvais matching, churn.
- Promesse : qualification stricte + matching intelligent + suivi.
- Cash : fees + abonnements entreprises.
- Scalable : scoring + process + réseau.
`.trim();

const specializeUnknown: Specializer = () => `
PITCH ANGLE — INCONNU :
- Rester générique + insérer "À préciser" là où nécessaire.
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

export const getPitchPrompt = (
  project: Project,
  user: UserProfile,
  agencyType?: AgencyType
): string => {
  const type = agencyType ?? project.agencyType ?? inferAgencyType(project);

  return `
Tu es un expert en narration stratégique + pitch exécutif du Trigenys Group.
Rédige un script de pitch ORAL de 2 minutes (≈ 260 à 320 mots), chronométré, en français.
Le pitch doit être fluide à dire à voix haute. Pas de jargon inutile.

PROJET : ${escape(project.name)}
FONDATEUR : ${escape(user.fullName || user.name)}
PAYS : ${escape(project.country)}
VISION : ${escape(project.mainGoal)}

CONTEXTE (source de vérité) :
- Offre / services : ${escape(project.offer)}
- ICP / cible : ${escape(project.icp)}
- Problème : ${escape(project.problem)}
- Différenciation : ${escape(project.differentiation)}
- Modèle de revenus : ${escape(project.revenueModel)}
- Preuves / traction : ${escape(project.proof)}

TYPE D’AGENCE DÉTECTÉ : ${type}
${SPECIALIZERS[type](project)}

RÈGLES ANTI-HALLUCINATION :
- N’invente pas de chiffres, prix, parts de marché. Si une info manque : écris "À préciser" (mais au maximum 3 fois).
- Pas de promesses irréalistes ("scalable à l’infini"). Utilise plutôt "scalable par standardisation".

CONSIGNES DE FORMAT :
- Utilise les titres de sections en "## " exactement comme ci-dessous.
- Sous chaque timecode, écris 2 à 5 phrases max.
- Ajoute des annotations de ton entre crochets : [Pause], [Sourire], [Ralentir], [Accélérer], [Insister].
- Termine par un CTA clair : "Je veux X de vous" (ex: intro, meeting, partenariat, budget pilote).

STRUCTURE À SUIVRE :
## 00:00 - L'ACCROCHE (Hook)
## 00:30 - LE CONTRASTE (Avant vs Après)
## 01:00 - LA MÉCANIQUE DE VALEUR
## 01:45 - L'APPEL À L'ACTION (CTA)

BONUS OBLIGATOIRE (1 ligne) :
Après le pitch, ajoute :
### Variante ultra-courte (20 secondes)
`.trim();
};
