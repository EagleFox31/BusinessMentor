
import { ChatMessage, UserProfile, AgencyType } from "../../types";

export type LegalDocType =
  | "NDA"
  | "MSA"            // Master Services Agreement
  | "SOW"            // Statement of Work
  | "CGV"            // Conditions Générales de Vente (services)
  | "TOS"            // Terms of Service (SaaS)
  | "PRIVACY"        // Politique de confidentialité
  | "DPA"            // Data Processing Agreement
  | "CONTRACTOR"     // Contrat de prestation / sous-traitance
  | "EMPLOYMENT"     // Contrat de travail (si besoin)
  | "UNKNOWN";

type PromptCtx = {
  agencyType: AgencyType;
  docType: LegalDocType;
  user: UserProfile;
  history: ChatMessage[];
};

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

const clamp = (s: string, max = 12000) => (s.length > max ? s.slice(0, max) + "\n\n[TRONQUÉ]" : s);

export function inferAgencyTypeFromHistory(history: ChatMessage[]): AgencyType {
  const blob = history.map(m => m.text).join(" ").toLowerCase();

  if (/\bpentest\b|\bsoc\b|\bsiem\b|\biso ?27001\b|\baudit\b|\bvuln|\bexploitation\b/.test(blob))
    return "CYBERSECURITY";
  if (/\bdata\b|\bbi\b|\betl\b|\bml\b|\bai\b|\brag\b|\bmodel\b|\bprompt\b|\bvector\b/.test(blob))
    return "DATA_AI";
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bcampagne\b|\binfluence\b/.test(blob))
    return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bbranding\b|\bcharte graphique\b/.test(blob))
    return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob))
    return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob))
    return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob))
    return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bapplication\b|\bapi\b|\bsaas\b|\bmaintenance\b|\bdelivery\b/.test(blob))
    return "DEV_ESN";

  return "UNKNOWN";
}

export function normalizeLegalDocType(type: string): LegalDocType {
  const t = (type || "").trim().toUpperCase();
  const map: Record<string, LegalDocType> = {
    "NDA": "NDA",
    "ACCORD DE CONFIDENTIALITÉ": "NDA",
    "MSA": "MSA",
    "MASTER SERVICES AGREEMENT": "MSA",
    "SOW": "SOW",
    "STATEMENT OF WORK": "SOW",
    "CAHIER DES CHARGES": "SOW",
    "CGV": "CGV",
    "CONDITIONS GÉNÉRALES": "CGV",
    "TOS": "TOS",
    "TERMS": "TOS",
    "PRIVACY": "PRIVACY",
    "POLITIQUE DE CONFIDENTIALITÉ": "PRIVACY",
    "DPA": "DPA",
    "DATA PROCESSING AGREEMENT": "DPA",
    "CONTRACTOR": "CONTRACTOR",
    "SOUS-TRAITANCE": "CONTRACTOR",
    "PRESTATION": "CONTRACTOR",
    "EMPLOYMENT": "EMPLOYMENT",
    "CONTRAT DE TRAVAIL": "EMPLOYMENT",
  };
  return map[t] ?? "UNKNOWN";
}

/** Modules (clauses/angles) par type d’agence */
type Specializer = (ctx: PromptCtx) => string;

const specializeDevEsn: Specializer = () => `
MODULE AGENCE — DEV/ESN (obligatoire si pertinent) :
- IP : propriété du code, cession/licence, composants réutilisables, open-source & licences.
- Scope control : procédure Change Request (CR), validations écrites, impacts coût/délai.
- Delivery : critères d’acceptation, recette, gestion des bugs (correctif vs évolution).
- Sécurité : gestion des accès, secrets, responsabilités client vs prestataire.
- Maintenance/SLA (si inclus) : disponibilité, délais d’intervention, exclusions.
`.trim();

const specializeDataAI: Specializer = () => `
MODULE AGENCE — DATA/IA :
- Données : minimisation, finalité, rétention, anonymisation/pseudonymisation.
- IA : interdiction d’entraînement non autorisé, logs, supervision humaine, biais.
- Propriété : modèles, features, notebooks, pipelines, datasets dérivés.
- Sécurité : accès datasets, chiffrement, séparation environnements, export/portabilité.
- DPA recommandé si données personnelles.
`.trim();

const specializeCyber: Specializer = () => `
MODULE AGENCE — CYBERSÉCURITÉ :
- Règles d’engagement (RoE) : périmètre strict, autorisations écrites, fenêtres de test.
- Chaîne de preuve : preuves, stockage, confidentialité, durée de conservation.
- Divulgation responsable : processus de notification, délais, coordination.
- Limites : pas de “do harm”, pas d’accès hors périmètre, procédures d’arrêt.
`.trim();

const specializeMarketing: Specializer = () => `
MODULE AGENCE — MARKETING/COMM :
- Propriété intellectuelle : droits des créations, licences médias, banques d’images.
- Brand safety : interdiction contenus trompeurs, fake reviews, dark patterns.
- Données & tracking : consentement, transparence, limites du ciblage.
- KPI & reporting : métriques, fréquence, obligations de moyens vs résultats.
`.trim();

const specializeDesign: Specializer = () => `
MODULE AGENCE — DESIGN/BRANDING :
- Livrables : sources (Figma), formats, droits d’usage, périmètre d’itérations.
- Originalité : anti-plagiat, références autorisées, validation client.
- Accessibilité : exigences minimales (lisibilité, contrastes).
`.trim();

const specializeConsulting: Specializer = () => `
MODULE AGENCE — CONSEIL/STRATÉGIE :
- Indépendance : transparence des hypothèses, limites, non-garantie de résultats.
- Confidentialité renforcée : documents, interviews, données internes.
- Propriété : livrables méthodologiques vs spécifiques client.
`.trim();

const specializeTraining: Specializer = () => `
MODULE AGENCE — FORMATION/EDTECH :
- IP contenu pédagogique : droits d’usage, revente, enregistrements.
- Évaluations : critères transparents, anti-triche (si applicable).
- Données apprenants : conservation, accès, suppression (si applicable).
`.trim();

const specializeHR: Specializer = () => `
MODULE AGENCE — RH/RECRUTEMENT :
- Données candidats : consentement, durée de conservation, suppression.
- Non-discrimination : critères pros uniquement.
- Confidentialité : cloisonnement client/candidat, interdiction revente CV sans accord.
`.trim();

const specializeUnknown: Specializer = () => `
MODULE AGENCE — INCONNU :
- Ajouter une section "Informations manquantes" pour qualifier l’activité et les risques.
`.trim();

const AGENCY_SPECIALIZERS: Record<AgencyType, Specializer> = {
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

/** Squelette commun d’un contrat (articles) */
function baseLegalDirectives(ctx: PromptCtx) {
  return `
DIRECTIVES DE RÉDACTION (strict) :
1) STRUCTURE : numérotation par ARTICLES + sous-articles (ex: "Article 1 — Objet").
2) LANGUE : français juridique clair, phrases courtes, définitions propres.
3) PROTECTION : clauses protectrices pour l’entreprise de ${escape(ctx.user.name)} (sans être abusif).
4) ANTI-HALLUCINATION : si un élément manque, insérer "À préciser" à l’endroit exact + lister en Annexe "Informations à compléter".
5) FORMAT : Markdown pur (titres, listes), prêt export PDF.
6) PAS D’INTRO : commence directement par le TITRE du document (ligne 1).
7) ADAPTATION : intégrer les infos extraites de l’historique (offre, périmètre, prix, délais, livrables, responsabilités).
`.trim();
}

/** Articles minimaux selon type de document */
function docTypeSkeleton(docType: LegalDocType) {
  switch (docType) {
    case "NDA":
      return `
ARTICLES MINIMAUX — NDA :
- Article 1 Définitions
- Article 2 Objet
- Article 3 Informations confidentielles (inclusions/exclusions)
- Article 4 Obligations de confidentialité
- Article 5 Durée
- Article 6 Retour/Destruction des informations
- Article 7 Responsabilité / dommages
- Article 8 Droit applicable & règlement des litiges
- Article 9 Signatures
`.trim();

    case "MSA":
      return `
ARTICLES MINIMAUX — MSA :
- Article 1 Définitions
- Article 2 Objet & champ d’application
- Article 3 Gouvernance & communication
- Article 4 Modalités de commande (SOW / bons)
- Article 5 Prix, facturation, paiement, pénalités
- Article 6 Obligations des parties (client vs prestataire)
- Article 7 Propriété intellectuelle
- Article 8 Confidentialité
- Article 9 Données & sécurité (si applicable)
- Article 10 Garanties, limites, exclusions
- Article 11 Limitation de responsabilité
- Article 12 Résiliation
- Article 13 Force majeure
- Article 14 Droit applicable & litiges
- Article 15 Signatures + Annexes
`.trim();

    case "SOW":
      return `
ARTICLES MINIMAUX — SOW :
- Article 1 Objet & contexte
- Article 2 Périmètre (IN / OUT)
- Article 3 Livrables & critères d’acceptation
- Article 4 Planning & jalons
- Article 5 Organisation (rôles/RACI, rituels)
- Article 6 Prix & modalités de paiement (acompte, jalons)
- Article 7 Change Request (CR)
- Article 8 Confidentialité & IP (référence MSA si existe)
- Article 9 Support / maintenance (si inclus)
- Article 10 Résiliation & effets
- Article 11 Annexes (spécifications, maquettes)
`.trim();

    case "CGV":
      return `
ARTICLES MINIMAUX — CGV SERVICES :
- Article 1 Objet & champ
- Article 2 Commande
- Article 3 Prix & paiement
- Article 4 Délais & exécution
- Article 5 Obligations client (infos, validations)
- Article 6 IP & licences
- Article 7 Confidentialité
- Article 8 Données & sécurité (si applicable)
- Article 9 Garanties & responsabilité (limitation)
- Article 10 Résiliation
- Article 11 Litiges
`.trim();

    case "DPA":
      return `
ARTICLES MINIMAUX — DPA :
- Article 1 Définitions & rôles (responsable / sous-traitant)
- Article 2 Objet & durée
- Article 3 Instructions documentées
- Article 4 Mesures de sécurité
- Article 5 Sous-traitants ultérieurs
- Article 6 Assistance (droits des personnes, incidents)
- Article 7 Localisation & transferts (si applicable)
- Article 8 Audit & conformité
- Article 9 Sort des données en fin de contrat
- Article 10 Annexes (catégories de données, finalités, durées)
`.trim();

    default:
      return `
ARTICLES MINIMAUX — DOCUMENT GÉNÉRIQUE :
- Article 1 Définitions
- Article 2 Objet
- Article 3 Obligations des parties
- Article 4 Prix & paiement (si applicable)
- Article 5 Confidentialité
- Article 6 Propriété intellectuelle
- Article 7 Responsabilité
- Article 8 Résiliation
- Article 9 Litiges & signatures
`.trim();
  }
}

/** Point d’entrée unique */
export const getFormalLegalPrompt = (
  type: string,
  history: ChatMessage[],
  user: UserProfile,
  agencyType?: AgencyType
): string => {
  const docType = normalizeLegalDocType(type);
  const detectedAgencyType = agencyType ?? inferAgencyTypeFromHistory(history);

  const historyText = clamp(
    history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n\n"),
    14000
  );

  const ctx: PromptCtx = { agencyType: detectedAgencyType, docType, user, history };

  return `
Tu es l'expert juridique principal du Trigenys Group.
Ta mission : rédiger un document contractuel "${escape(type)}" (docType=${docType}) pour l’entrepreneur ${escape(user.name)} basé en ${escape(user.country)}.

CONTEXTE DE DISCUSSION (preuve) :
---
${historyText}
---

${baseLegalDirectives(ctx)}

TYPE D’AGENCE : ${detectedAgencyType}
${AGENCY_SPECIALIZERS[detectedAgencyType](ctx)}

EXIGENCES SPÉCIFIQUES AU TYPE DE DOCUMENT :
${docTypeSkeleton(docType)}

CONTRAINTE FINALE :
- N’écris aucun conseil “hors document”. Le rendu doit être le contrat complet, directement.
`.trim();
};
