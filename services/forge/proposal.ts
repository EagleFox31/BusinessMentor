
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

/** Modules de spécialisation : ce qui change VRAIMENT dans une propale */
type Specializer = (project: Project) => string;

const specializeDevEsn: Specializer = () => `
SPÉCIALISATION — DEV/ESN :
- Insister sur : cadrage (Discovery), delivery (Build), stabilisation (Run), maintenance/SLA.
- Inclure : critères d’acceptation/recette, Change Request (CR), gestion bug vs évolution.
- Ajouter : matrice RACI (Client vs Prestataire) et périmètre IN/OUT très net.
`.trim();

const specializeDataAI: Specializer = () => `
SPÉCIALISATION — DATA/IA :
- Ajouter un "Data Readiness Pack" (audit qualité sources) avant de promettre des dashboards/IA.
- Inclure : gouvernance (data lineage, accès), sécurité datasets, et option DPA si données perso.
- Définir : unités (sources, connecteurs, fréquence refresh, volumétrie, nombre de dashboards/modèles).
`.trim();

const specializeCyber: Specializer = () => `
SPÉCIALISATION — CYBERSECURITY :
- Inclure : Règles d’Engagement (RoE), périmètre strict, fenêtres de test, clause “do no harm”.
- Livrables : rapport exec + rapport technique + plan de remédiation + re-test (option).
- Définir : profondeur (black/grey/white box), actifs couverts, critères de sévérité.
`.trim();

const specializeMarketing: Specializer = () => `
SPÉCIALISATION — MARKETING/COMM :
- Séparer clairement : honoraires agence vs budget média (hors prestation).
- Inclure : KPI, cadence reporting, process test&learn, brand safety.
- Livrables : calendrier éditorial, créas, tracking, landing pages (si inclus).
`.trim();

const specializeDesign: Specializer = () => `
SPÉCIALISATION — DESIGN/BRANDING :
- Inclure : nombre d’itérations, livrables sources (Figma), droits d’usage, accessibilité.
- Livrables : design system (si inclus), guidelines, assets exportés, handoff dev.
`.trim();

const specializeConsulting: Specializer = () => `
SPÉCIALISATION — CONSEIL/STRATÉGIE :
- Insister sur : diagnostic → cible → plan → pilotage → transfert.
- Ajouter : hypothèses, limites, livrables de décision (pas juste slides), gouvernance comités.
`.trim();

const specializeTraining: Specializer = () => `
SPÉCIALISATION — FORMATION/EDTECH :
- Inclure : format (cohortes), prérequis, évaluation, supports, projet fil rouge, suivi post-formation.
- Livrables : supports + replays (si autorisés) + attestation (si applicable).
`.trim();

const specializeHR: Specializer = () => `
SPÉCIALISATION — RH/RECRUTEMENT :
- Inclure : process sourcing/qualification, délais, confidentialité candidats, non-discrimination.
- Modèle : fee, success fee, abonnement, garantie de remplacement (si prévue).
`.trim();

const specializeUnknown: Specializer = () => `
SPÉCIALISATION — INCONNU :
- Rester générique, et ajouter une section "Informations à confirmer" très ciblée.
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

export const getProposalPrompt = (
  project: Project,
  user: UserProfile,
  agencyType?: AgencyType
): string => {
  const type = agencyType ?? project.agencyType ?? inferAgencyType(project);

  return `
Tu es un ingénieur d'affaires Senior du Trigenys Group. Rédige un template de Proposition Commerciale institutionnelle.
CIBLE : un client stratégique potentiel pour ${escape(project.name)}.

CONTEXTE (source de vérité) :
- Projet : ${escape(project.name)}
- Pays : ${escape(project.country)}
- Devise : ${escape(project.currency)}
- Offre / services : ${escape(project.offer)}
- ICP / profil client : ${escape(project.icp)}
- Problème client : ${escape(project.problem)}
- Valeur créée : ${escape(project.value)}
- Différenciation : ${escape(project.differentiation)}
- Délais souhaités : ${escape(project.timeline)}
- Hypothèses connues : ${escape(project.assumptions)}
- Contact côté client : ${escape(project.clientContact)}
- Signataire côté prestataire : ${escape(user.fullName || user.name)}

TYPE D’AGENCE DÉTECTÉ : ${type}
${SPECIALIZERS[type](project)}

RÈGLES ANTI-HALLUCINATION :
- N’invente jamais des chiffres (prix, ROI, parts de marché). Si manquant : "À préciser".
- Pas de phrases vagues type “la seule solution viable” sans justification : remplacer par 3 preuves concrètes.
- Document doit tenir sur ~2 à 4 pages (densité pro, pas un roman).

RÈGLES DE FORMATAGE (strict) :
- Uniquement "## " pour sections, "### " pour sous-sections.
- Listes à puces : "- " uniquement.
- Inclure exactement 2 tableaux Markdown :
  1) Calendrier (phases/jalons)
  2) Investissement (packs ou lignes budgétaires)

STRUCTURE À PRODUIRE :

## PAGE DE GARDE
### Titre
- "Proposition Commerciale — ${escape(project.name)}"
### Métadonnées
- Référence : À préciser
- Date : ${new Date().toLocaleDateString("fr-FR")}
- Client : À préciser
- Émetteur : ${escape(user.fullName || user.name)}

## COMPRÉHENSION DE VOS ENJEUX
### Constat
- Reformuler la douleur en langage métier
### Impacts
- Temps, argent, risques, image (sans inventer : si besoin “À préciser”)
### Objectif
- Ce que le client veut obtenir concrètement

## SOLUTION STRATÉGIQUE APEX
### Approche
- 3 à 6 bullets : méthode + pourquoi ça marche
### Périmètre
- IN : 5–10 bullets
- OUT : 5 bullets (anti scope creep)
### Livrables
- 6–12 livrables concrets, vérifiables
### Hypothèses & prérequis
- Accès, interlocuteurs, données, validations, matériel, etc.

## CALENDRIER DE DÉPLOIEMENT
### Phases & jalons
- Fournir un tableau Markdown : Phase | Durée | Livrables | Critère d’acceptation
### Gouvernance projet
- Rituels (kickoff, weekly, démo, recette)
- RACI simplifié (Client vs Prestataire)

## INVESTISSEMENT ET CONDITIONS
### Structure de prix
- Packs ou lignes (selon modèle) + ce que ça inclut
### Tableau investissement
- Tableau Markdown : Item/PACK | Inclus | Prix | Modalité de paiement
### Conditions commerciales
- Acompte : À préciser
- Paiement : jalons / mensuel
- Validations : délais de réponse client
- Change Request : obligatoire si hors périmètre

## RISQUES & MESURES DE MAÎTRISE
### Risques
- 5 risques max (scope, données, accès, délais, dépendances)
### Parades
- 1 parade par risque (pragmatique)

## POURQUOI NOUS
### Différenciation
- 5 bullets : preuves, process, assets, qualité
### Références / preuves
- Portfolio / cas / démos : À préciser

## PROCHAINES ÉTAPES
- 1) Validation du périmètre (date)
- 2) Kickoff (date)
- 3) Lancement (date)
- CTA : proposer 2 créneaux de call (30–45 min)

## SIGNATURES
- Pour le Client : Nom / fonction / date / signature
- Pour ${escape(project.name)} : ${escape(user.fullName || user.name)} / date / signature
`.trim();
};
