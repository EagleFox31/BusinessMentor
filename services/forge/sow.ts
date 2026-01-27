
import { Project, UserProfile, AgencyType } from "../../types";

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

export function inferAgencyType(project: Project): AgencyType {
  const blob = [
    project.name,
    project.offer,
    project.description,
    project.problem,
    project.services,
    project.stack,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bpentest\b|\bsoc\b|\bsiem\b|\bvuln|\biso ?27001\b|\baudit\b/.test(blob)) return "CYBERSECURITY";
  if (/\bdata\b|\bbi\b|\betl\b|\bml\b|\bai\b|\brag\b|\bmodel\b|\bvector\b/.test(blob)) return "DATA_AI";
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bcampagne\b|\binfluence\b/.test(blob))
    return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bbranding\b|\bcharte graphique\b/.test(blob)) return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob)) return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob)) return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob))
    return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bapplication\b|\bapi\b|\bmaintenance\b|\bdelivery\b|\bsupport\b/.test(blob))
    return "DEV_ESN";

  return "UNKNOWN";
}

/** Spécialisations SOW : livrables + critères d’acceptation + exclusions typiques */
type Specializer = (project: Project) => string;

const specializeDevEsn: Specializer = () => `
SPÉCIFIQUE — DEV/ESN :
- Inclure : environnements (dev/stage/prod), CI/CD (si prévu), repo, documentation, handover.
- Critères d’acceptation : tests (unit/int/e2e) minimum, revue de code, démo, PV de recette.
- Exclusions : support illimité, “petites modifs gratuites”, changement de scope sans CR.
- Ajouter : procédure Change Request (CR) + classification bug vs évolution.
`.trim();

const specializeDataAI: Specializer = () => `
SPÉCIFIQUE — DATA/IA :
- Inclure : sources de données, connecteurs, transformations, dashboards/modèles, monitoring.
- Critères : qualité (taux d’erreur), latence refresh, reproductibilité, data lineage, accès.
- Exclusions : correction de données à la source hors contrôle, promesses IA sans data readiness.
- Ajouter : phase "Data Readiness" + conditions de disponibilité datasets.
`.trim();

const specializeCyber: Specializer = () => `
SPÉCIFIQUE — CYBERSECURITY :
- Inclure : règles d’engagement (RoE), périmètre (assets), fenêtres, niveau (black/grey/white).
- Livrables : exec report + tech report + preuves + plan de remédiation + re-test (option).
- Critères : couverture du périmètre, classification sévérités, recommandations actionnables.
- Exclusions : actions hors périmètre, exploitation destructive, publication sans accord.
`.trim();

const specializeMarketing: Specializer = () => `
SPÉCIFIQUE — MARKETING/COMM :
- Inclure : setup tracking, planning créa, volume de contenus, canaux, reporting.
- Critères : livrables livrés à temps + KPI définis (sans garantie de résultats si non contracté).
- Exclusions : budget média (hors prestation), accès non fourni aux comptes, validation tardive.
`.trim();

const specializeDesign: Specializer = () => `
SPÉCIFIQUE — DESIGN/BRANDING :
- Inclure : livrables Figma, design system (si prévu), nombre d’itérations, handoff.
- Critères : validation maquettes, checklist accessibilité, assets exportés.
- Exclusions : itérations illimitées, refonte de scope sans CR, intégration dev si non incluse.
`.trim();

const specializeConsulting: Specializer = () => `
SPÉCIFIQUE — CONSEIL/STRATÉGIE :
- Inclure : ateliers, livrables de décision, roadmap, gouvernance, transfert.
- Critères : livrables validés en comité + décisions actées.
- Exclusions : exécution opérationnelle si non incluse, disponibilité client insuffisante.
`.trim();

const specializeTraining: Specializer = () => `
SPÉCIFIQUE — FORMATION/EDTECH :
- Inclure : programme, durée, supports, évaluations, présence, projet fil rouge.
- Critères : sessions tenues, supports livrés, évaluations réalisées, attestation si prévu.
- Exclusions : garantie emploi, coaching illimité hors forfait.
`.trim();

const specializeHR: Specializer = () => `
SPÉCIFIQUE — RH/RECRUTEMENT :
- Inclure : périmètre postes, process qualification, shortlist, délais, confidentialité.
- Critères : nombre de profils soumis, délai, feedback client, étape de validation.
- Exclusions : garantie absolue d’embauche, délais si feedback client absent.
`.trim();

const specializeUnknown: Specializer = () => `
SPÉCIFIQUE — INCONNU :
- Ajouter une section "Informations à confirmer" (10 points max) avant de figer scope/prix.
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

export const getSowPrompt = (
  project: Project,
  user: UserProfile,
  agencyType?: AgencyType
): string => {
  const type = agencyType ?? project.agencyType ?? inferAgencyType(project);

  return `
Tu es un Project Manager rigoureux du Trigenys Group. Rédige un "Statement of Work" (SOW) contractuel, prêt à signature.
STYLE : précis, chirurgical, zéro ambiguïté.

PROJET : ${escape(project.name)}
PAYS : ${escape(project.country)}
DEVISE : ${escape(project.currency)}
CLIENT : ${escape(project.clientName)}
PRESTATAIRE : ${escape(user.fullName || user.name)}

CONTEXTE (source de vérité) :
- Objectif : ${escape(project.mainGoal)}
- Offre / services : ${escape(project.offer)}
- Périmètre fonctionnel : ${escape(project.scope)}
- Délais / dates clés : ${escape(project.timeline)}
- Contraintes : ${escape(project.constraints)}
- Budget / pricing : ${escape(project.pricing)}
- Hypothèses : ${escape(project.assumptions)}

TYPE D’AGENCE DÉTECTÉ : ${type}
${SPECIALIZERS[type](project)}

RÈGLES ANTI-HALLUCINATION :
- N’invente aucune info manquante : écris "À préciser" au bon endroit.
- Ne pas raconter l’histoire : uniquement du contractuel.
- Inclure 2 tableaux Markdown obligatoires :
  (1) Tableau "Phases & Livrables"
  (2) Tableau "RACI" (Client / Prestataire)

FORMAT STRICT :
- Utiliser uniquement "## " pour sections, "### " pour sous-sections.
- Listes : "- " uniquement.
- Pas de sections hors structure.

STRUCTURE À PRODUIRE :

## IDENTIFICATION DU DOCUMENT
### Parties
- Client : À préciser
- Prestataire : ${escape(user.fullName || user.name)}
### Référence & dates
- Référence : À préciser
- Date d’effet : À préciser
- Durée : À préciser

## OBJECTIF DE LA MISSION
- Décrire l’objectif mesurable et le résultat attendu.

## PÉRIMÈTRE DE LA MISSION (SCOPE)
### Livrables (exhaustif)
- Lister les livrables concrets, vérifiables.
### Exigences qualité
- Tests / validation / standards (selon type d’agence).
### Limites de service
- Horaires, canaux, volumes, nombre d’itérations, etc.

## EXCLUSIONS CRITIQUES (ANTI SCOPE CREEP)
- Liste stricte de ce qui n’est pas inclus.
- Ajouter explicitement : "Tout élément non listé dans le scope est hors périmètre et soumis à Change Request."

## PLAN DE DÉPLOIEMENT (PHASES & JALONS)
### Tableau Phases & Livrables (obligatoire)
- Table Markdown : Phase | Durée | Livrables | Critères d’acceptation | Dépendances
### Gouvernance projet
- Kickoff, weekly, démo, recette, canal de communication officiel.

## CRITÈRES D'ACCEPTATION
### Règles générales
- Comment une phase est acceptée (PV, validation email, délai max de retour).
### Critères par livrable
- Donner 6–12 critères concrets (ex: "tests passants", "doc livrée", "démo validée").

## RESPONSABILITÉS PARTAGÉES
### Responsabilités Client
- Accès, données, interlocuteurs, validations, matériel, environnements, budget média (si applicable), etc.
### Responsabilités Prestataire
- Exécution, qualité, reporting, sécurité, confidentialité.

## TABLEAU RACI (obligatoire)
- Table Markdown : Activité | Client | Prestataire | Commentaire

## GESTION DES CHANGEMENTS (CHANGE REQUEST)
- Définir la procédure : demande → estimation → validation → exécution
- Définir : impact coût/délai, et classification bug vs évolution si applicable.

## RISQUES & DÉPENDANCES
- 5 risques max + mesures de mitigation.
- 5 dépendances max + impact.

## CONDITIONS COMMERCIALES (si applicable)
- Prix : À préciser
- Paiement : acompte / jalons / mensuel
- Retards de paiement : pénalités (À préciser selon politique)
- Suspension : conditions

## CONFIDENTIALITÉ & PROPRIÉTÉ INTELLECTUELLE
- Confidentialité (NDA si applicable).
- IP : livrables, sources, licences, droits d’usage.

## SIGNATURES
- Client : Nom / fonction / date / signature
- Prestataire : ${escape(user.fullName || user.name)} / date / signature
`.trim();
};
